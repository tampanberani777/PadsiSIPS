import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json(
      { error: "Tidak ada file yang diunggah. Pastikan memilih CSV dulu." },
      { status: 400 }
    );
  }

  let saved = 0;
  let skippedInvalid = 0;
  let skippedDuplicate = 0;

  // Ambil nama yang sudah ada supaya tidak double
  const existing = await prisma.stokAwal.findMany({ select: { nama: true } });
  const existingNama = new Set(existing.map((i: { nama: string }) => i.nama.trim().toLowerCase()));

  for (const file of files) {
    const text = await file.text();

    // DETEKSI TAB ATAU KOMA
    const delimiter = text.includes("\t") ? "\t" : ",";

    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: delimiter,
    });

    for (const raw of records as Array<{ nama?: string; jumlah?: any; satuan?: string; kategori?: string }>) {
      let nama = raw.nama?.trim();
      let jumlah = parseFloat(raw.jumlah);
      let satuan = raw.satuan?.trim().toUpperCase();
      let kategori = raw.kategori?.trim().toUpperCase();

      // AUTO FIX SATUAN
      if (satuan === "KG" || satuan === "KILO" || satuan === "KILOGRAM") satuan = "KG";
      if (satuan === "PRODUK" || satuan === "PCS") satuan = "PRODUK";
      if (satuan === "LITER" || satuan === "LTR") satuan = "LITER";

      // VALIDASI ENUM
      const validSatuan = ["KG", "PRODUK", "LITER"];
      const validKategori = ["BAHAN", "PRODUK"];

      if (!nama || !jumlah || !validSatuan.includes(satuan) || !validKategori.includes(kategori)) {
        skippedInvalid++;
        continue;
      }

      const namaKey = nama.toLowerCase();
      if (existingNama.has(namaKey)) {
        skippedDuplicate++;
        continue;
      }

      existingNama.add(namaKey); // cegah double dalam batch yang sama

      await prisma.stokAwal.create({
        data: {
          nama,
          jumlah,
          satuan,
          kategori,
        },
      });

      saved++;
    }
  }

  if (saved === 0) {
    return NextResponse.json({
      totalFiles: files.length,
      savedRows: 0,
      skippedInvalid,
      skippedDuplicate,
      message: "CSV sudah dibaca, tapi belum ada data yang bisa dipakai. Cek lagi format kolom atau pastikan belum pernah diunggah.",
    });
  }

  return NextResponse.json({
    totalFiles: files.length,
    savedRows: saved,
    skippedInvalid,
    skippedDuplicate,
    message: "Berhasil, data stok awal tersimpan tanpa duplikasi.",
  });
}
