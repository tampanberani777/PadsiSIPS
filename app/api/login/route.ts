import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Username tidak ditemukan" });
    }

    if (user.password !== password) {
      return NextResponse.json({ success: false, message: "Password salah" });
    }

    const res = NextResponse.json({ success: true, role: user.role });
    // Allow client to read role/auth for UI; still scoped to root path
    res.cookies.set("sips_auth", "true", { path: "/", httpOnly: false });
    res.cookies.set("sips_role", user.role, { path: "/", httpOnly: false });
    return res;
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
