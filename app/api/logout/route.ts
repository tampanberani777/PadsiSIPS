import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  // clear cookies
  res.cookies.set("sips_auth", "", { path: "/", maxAge: 0 });
  res.cookies.set("sips_role", "", { path: "/", maxAge: 0 });
  return res;
}
