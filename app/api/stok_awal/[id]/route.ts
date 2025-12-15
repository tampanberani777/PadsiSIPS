  import { NextResponse } from "next/server";
  import prisma from "@/lib/prisma";

  // GET detail stok awal
  export async function GET(req: Request, { params }: any) {
    const id = Number(params.id);

    try {
      const data = await prisma.stokAwal.findUnique({
        where: { id },
      });

      if (!data) {
        return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
      }

      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json(
        { error: "Gagal mengambil detail" },
        { status: 500 }
      );
    }
  }

  // UPDATE stok awal
  export async function PUT(req: Request, { params }: any) {
    const id = Number(params.id);

    try {
      const body = await req.json();
      const { nama, jumlah, satuan, kategori } = body;

      const updated = await prisma.stokAwal.update({
        where: { id },
        data: {
          nama,
          jumlah: parseFloat(jumlah),
          satuan,
          kategori,
        },
      });

      return NextResponse.json(updated);
    } catch (error) {
      return NextResponse.json(
        { error: "Gagal update data" },
        { status: 500 }
      );
    }
  }

  // DELETE stok awal
  export async function DELETE(req: Request, { params }: any) {
    const id = Number(params.id);

    try {
      await prisma.stokAwal.delete({
        where: { id },
      });

      return NextResponse.json({ message: "Berhasil menghapus" });
    } catch (error) {
      return NextResponse.json(
        { error: "Gagal menghapus data" },
        { status: 500 }
      );
    }
  }
