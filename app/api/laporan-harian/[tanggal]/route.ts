import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = { tanggal?: string };

export async function GET(_req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const { tanggal: raw } = await params;
    if (!raw) {
      return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 });
    }

    // wajib format YYYY-MM-DD
    const tanggal = raw.split("T")[0];

    const start = new Date(tanggal + "T00:00:00.000Z");
    const end = new Date(tanggal + "T23:59:59.999Z");
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 });
    }

    const data = await prisma.laporanHarian.findMany({
      where: { createdAt: { gte: start, lte: end } },
      orderBy: { nama: "asc" },
    });

    return NextResponse.json(data);
  } catch (e) {
    console.error("ERROR:", e);
    return NextResponse.json({ error: "Gagal memuat detail laporan" }, { status: 500 });
  }
}
