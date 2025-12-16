import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Kembalikan daftar tanggal unik (per hari) agar satu reset = satu baris
export async function GET() {
  try {
    const list = await prisma.laporanHarian.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const seen = new Set<string>();
    const tanggalPerHari = list.reduce((acc: { createdAt: string }[], item) => {
      const dateStr =
        item.createdAt instanceof Date
          ? item.createdAt.toISOString().split("T")[0]
          : String(item.createdAt).split("T")[0];

      if (dateStr && !seen.has(dateStr)) {
        seen.add(dateStr);
        acc.push({ createdAt: dateStr });
      }
      return acc;
    }, []);

    return NextResponse.json(tanggalPerHari);
  } catch (e) {
    return NextResponse.json({ error: "Gagal memuat laporan" }, { status: 500 });
  }
}
