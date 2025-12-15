import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET dengan filter kategori (BAHAN / PRODUK)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kategori = searchParams.get("kategori");

    const data = await prisma.stokAwal.findMany({
      where: kategori ? { kategori } : undefined, 
      orderBy: { id: "desc" },
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// POST tambah stok awal
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama, jumlah, satuan, kategori } = body;

    if (!nama || !jumlah || !satuan || !kategori) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const newData = await prisma.stokAwal.create({
      data: {
        nama,
        jumlah: parseFloat(jumlah),
        satuan,
        kategori,
      },
    });

    return NextResponse.json(newData);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menambah data" },
      { status: 500 }
    );
  }
}
