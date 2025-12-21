import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password, captcha } = body;

  // Bypass captcha hanya saat testing
  if (process.env.DISABLE_CAPTCHA !== "true") {
    if (!captcha || captcha !== "VALID") {
      return NextResponse.json({ message: "Captcha salah" }, { status: 400 });
    }
  }

  if (username === "RobinOyako" && password === "Oyako123") {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ message: "Login gagal" }, { status: 401 });
}
