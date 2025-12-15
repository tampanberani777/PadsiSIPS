import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const tanggal = new Date(params.tanggal);

    const list = await prisma.laporanHarian.findMany({
      where: {
        createdAt: {
          gte: new Date(tanggal.setHours(0,0,0,0)),
          lt: new Date(tanggal.setHours(23,59,59,999)),
        }
      },
      orderBy: { nama: "asc" }
    });

    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json({ error: "Gagal memuat detail laporan" }, { status: 500 });
  }
}
