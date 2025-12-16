'use client';

import { useEffect, useState } from "react";
import AcmeLogo from "@/app/ui/logorangga";
import Link from "next/link";
import { ArrowRightIcon, ArrowRightOnRectangleIcon, UserIcon } from "@heroicons/react/24/outline";

export default function HomePage() {
  const [role, setRole] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
      return match ? decodeURIComponent(match.split("=")[1]) : null;
    };
    const logged = getCookie("sips_auth") === "true";
    if (logged) setRole(getCookie("sips_role"));
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/65 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/warungoyako.jpg')" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur">
          <AcmeLogo />
          {role ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full bg-white/35 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/45 transition text-black"
              >
                <UserIcon className="w-4 h-4" />
                {role}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-lg bg-white text-slate-800 shadow-lg overflow-hidden">
                  <div className="px-4 py-2 text-sm border-b border-slate-200">Role: {role}</div>
                  <button
                    onClick={async () => {
                      await fetch("/api/logout", { method: "POST" });
                      setRole(null);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-white/35 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/45 transition text-black"
            >
              Masuk
            </Link>
          )}
        </header>

        <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="max-w-2xl space-y-5">
            <p className="text-xs tracking-[0.35em] uppercase text-amber-100">Warung Oyako</p>

            <h1 className="text-4xl md:text-5xl font-black leading-tight drop-shadow">
              SIPS — Sistem Informasi Pengelolaan Sisa
            </h1>

            <p className="text-lg text-amber-50">
              Kelola data sisa, pantau reset harian, dan simpan laporan dalam satu dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-base font-semibold text-black shadow-lg shadow-amber-500/30 hover:bg-amber-400 transition"
              >
                Mulai Sekarang
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
