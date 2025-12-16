import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // 1️⃣ Ambil stok_awal & sisa
    const stokAwal = await prisma.stokAwal.findMany();
    const sisa = await prisma.sisa.findMany();

    if (stokAwal.length === 0) {
      return NextResponse.json(
        { error: "Stok awal kosong — tidak bisa reset harian" },
        { status: 400 }
      );
    }

    // 2️⃣ Hitung laporan harian berdasarkan stok_awal & sisa
    const laporan = stokAwal.map((item: { nama: string; jumlah: number; kategori: string }) => {
      const s = sisa.find((x: { nama: string; jumlah: number }) => x.nama === item.nama);
      const sisaJumlah = s?.jumlah ?? 0;

      return {
        nama: item.nama,
        stokAwal: item.jumlah,
        sisa: sisaJumlah,
        penggunaan: item.jumlah - sisaJumlah,
        kategori: item.kategori,
      };
    });

    // 3️⃣ Simpan laporan_harian (dengan tanggal hari ini)
    await prisma.laporanHarian.createMany({
      data: laporan,
    });

    // 4️⃣ ❗Kosongkan tabel stok_awal & sisa
    await prisma.sisa.deleteMany();
    await prisma.stokAwal.deleteMany();

    // 5️⃣ UI akan menampilkan tabel kosong — user bisa isi stok awal baru
    return NextResponse.json({
      success: true,
      message: "Reset harian berhasil! Semua data stok & sisa dikosongkan.",
      laporanTersimpan: laporan.length,
    });
  } catch (err) {
    console.error("RESET ERROR:", err);
    return NextResponse.json(
      { error: "Reset harian gagal" },
      { status: 500 }
    );
  }
}
