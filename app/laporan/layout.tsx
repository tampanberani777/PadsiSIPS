'use client';

import AcmeLogo from "@/app/ui/logorangga";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDownIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/sisa", label: "Sisa" },
    { href: "/stok_awal", label: "Stok" },
    { href: "/laporan", label: "Laporan" },
  ];

  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
      return match ? decodeURIComponent(match.split("=")[1]) : null;
    };
    const loggedIn = getCookie("sips_auth") === "true";
    const r = getCookie("sips_role");
    setRole(r);
    if (!loggedIn || (r !== "Owner" && r !== "head Kitchen")) {
      setAuthorized(false);
      router.replace("/login?reason=must-login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (authorized === null) return null;
  if (authorized === false) return null;

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setMenuOpen(false);
    router.replace("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f2ea] text-slate-900">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-[#d7cbb8] bg-[#1f1b17]/90 px-6 py-3 shadow backdrop-blur text-white">
        <div className="w-12 h-12">
          <AcmeLogo />
        </div>

        <nav className="flex gap-10 text-base font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                pathname === link.href
                  ? "text-amber-200 border-b border-amber-300 pb-1"
                  : "text-gray-200 hover:text-amber-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/25 transition"
          >
            <span>{role ?? "User"}</span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-lg bg-white text-slate-800 shadow-lg overflow-hidden">
              <div className="px-4 py-2 text-sm border-b border-slate-200">Role: {role ?? "-"}</div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="pt-24 px-6 md:px-8 flex-1">{children}</main>
    </div>
  );
}
