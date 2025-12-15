import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // ambil stok_awal
    const stokAwal = await prisma.stokAwal.findMany();
    const sisa = await prisma.sisa.findMany();

    // hitung laporan harian
    const laporan = stokAwal.map((item) => {
      const s = sisa.find((x) => x.nama === item.nama);
      const sisaJumlah = s?.jumlah ?? 0;
      return {
        nama: item.nama,
        stokAwal: item.jumlah,
        sisa: sisaJumlah,
        penggunaan: item.jumlah - sisaJumlah,
        kategori: item.kategori,
      };
    });

    // simpan ke tabel laporan_harian
    await prisma.laporanHarian.createMany({
      data: laporan,
    });

    // reset tabel sisa
    await prisma.sisa.deleteMany();
    await prisma.sisa.createMany({
      data: stokAwal.map((i) => ({
        nama: i.nama,
        jumlah: i.jumlah,
        satuan: i.satuan,
        kategori: i.kategori,
      })),
    });

    return NextResponse.json({
      message: "Reset harian sukses!",
      laporanTersimpan: laporan.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Reset gagal" },
      { status: 500 }
    );
  }
}
