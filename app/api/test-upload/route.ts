import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" });
  }

  let saved = 0;

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

    for (const raw of records) {
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
        console.log("SKIP data tidak valid:", raw);
        continue;
      }

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
      message: "CSV terbaca, tapi semua baris tidak valid / formatnya salah.",
    });
  }

  return NextResponse.json({
    totalFiles: files.length,
    savedRows: saved,
    message: "Berhasil dimasukkan!",
  });
}
