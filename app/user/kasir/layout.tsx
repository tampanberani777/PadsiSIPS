'use client';

import AcmeLogo from '@/app/ui/logorangga';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navLinks = [
    { href: '/user/kasir/sisa', label: 'Sisa' },
    { href: '/stok_awal', label: 'Stok' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-black">
      {/* Header putih mirip di gambar */}
      <header className="flex justify-between items-center px-6 py-3 bg-white shadow-sm fixed top-0 w-full z-50">
        {/* Logo bulat di kiri */}
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <AcmeLogo />
          </div>
        </div>

        {/* Menu di tengah */}
        <nav className="flex gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-gray-700 text-lg font-medium hover:text-black transition-colors ${
                pathname === link.href ? 'text-black font-semibold' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Foto profil di kanan */}
        <Link href="/login">
          <UserCircleIcon className="w-8 h-8 text-gray-700 hover:text-black transition" />
        </Link>
      </header>

      {/* Konten halaman (biar gak ketutup header, kasih padding top) */}
      <main className="pt-20">{children}</main>
    </div>
  );
}
