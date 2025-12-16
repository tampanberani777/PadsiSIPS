import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = ["/sisa", "/stok_awal", "/laporan", "/user"];

const roleAccess: Record<string, string[]> = {
  "/user/kasir": ["kasir"],
  "/user": ["Owner", "head_kitchen"], // fallback for other user paths
  "/sisa": ["Owner", "head_kitchen"],
  "/stok_awal": ["Owner", "head_kitchen"],
  "/laporan": ["Owner", "head_kitchen"],
};

function allowed(pathname: string, role: string | undefined) {
  const entry = Object.entries(roleAccess).find(([prefix]) => pathname.startsWith(prefix));
  if (!entry) return true; // no restriction
  const [, roles] = entry;
  return role ? roles.includes(role) : false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const loggedIn = req.cookies.get("sips_auth")?.value === "true";
  const role = req.cookies.get("sips_role")?.value;

  if (loggedIn && allowed(pathname, role)) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("reason", "must-login");
  return NextResponse.redirect(loginUrl);
}
