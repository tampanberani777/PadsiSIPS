import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const list = await prisma.laporanHarian.findMany({
      select: {
        createdAt: true
      },
      distinct: ["createdAt"],
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json({ error: "Gagal memuat laporan" }, { status: 500 });
  }
}
