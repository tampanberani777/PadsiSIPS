'use client';

import AcmeLogo from '@/app/ui/logorangga';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';

export default function CatalogPage() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/catalog', label: 'Catalog' },
    { href: '/profile/anggota', label: 'Profile' },
    { href: '/testimoni', label: 'Testimoni' },
  ];

  const products = [
    { name: 'Headset Gaming 1x', price: 'Rp 400.000', image: '/products/headset 1.jpg' },
    { name: 'Headset Gaming 2y', price: 'Rp 500.000', image: '/products/headset 2.jpg' },
    { name: 'Headset Wireless 2r', price: 'Rp 1.100.000', image: '/products/headset 3.jpg' },
    { name: 'Xbox Series X 1TB', price: 'Rp 7.000.000', image: '/products/xbox x.jpg' },
    { name: 'Sony Playstation 5', price: 'Rp 8.500.000', image: '/products/ps5.jpg' },
    { name: 'Xbox Series S 512GB', price: 'Rp 5.700.000', image: '/products/xbox s.jpg' },
    { name: 'Virtual Reality', price: 'Rp 5.000.000', image: '/products/vr.jpg' },
    { name: 'Nitendo Switch', price: 'Rp 4.000.000', image: '/products/nitendo.jpg' },
    { name: 'Controller PS5', price: 'Rp 550.000', image: '/products/controller 1.jpg' },
    { name: 'Controller PS4', price: 'Rp 480.000', image: '/products/controller 2.jpg' },
    { name: 'Keyboard Blue Switch', price: 'Rp 300.000', image: '/products/keyboard1.jpg' },
    { name: 'Keyboard Red Switch', price: 'Rp 224.000', image: '/products/keyboard 2.jpg' },
    { name: 'Mouse Wireless Lgi', price: 'Rp 1.100.000', image: '/products/mouse 1.jpg' },
    { name: 'Mouse', price: 'Rp 100.000', image: '/products/mouse 2.jpg' },
    { name: 'Mouse Wireless', price: 'Rp 300.000', image: '/products/mouse 3.jpg' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1f29] to-[#312c49] text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-500">
        <AcmeLogo />
        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-red-500 transition-colors ${
                pathname === link.href ? 'text-red-500 font-semibold' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/login">
          <UserCircleIcon className="w-8 h-8 hover:text-red-500" />
        </Link>
      </header>

      {/* Main */}
      <main className="p-4 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product, idx) => (
            <div
              key={idx}
              className="bg-black bg-opacity-50 rounded-lg p-4 shadow-xl flex flex-col items-center"
            >
              <div className="relative w-full h-32 mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain rounded"
                />
              </div>
              <p className="font-semibold text-center">{product.name}</p>
              <p className="text-sm opacity-75">{product.price}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Tombol Profil Toko */}
      <Link href="/catalog">
        <button className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-500">
          Lanjut Katalog
        </button>
      </Link>

      {/* Footer */}
      <footer className="p-4 text-center border-t border-white border-opacity-20">
        <div className="mb-2">© 2025 RANGGA GAMING STORE.</div>
        <div className="flex justify-center gap-6 text-2xl text-gray-300">
          <a
            href="https://instagram.com/yourstore"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-600 hover:scale-110 transition-all"
          >
            <FaInstagram />
          </a>
          <a
            href="https://facebook.com/yourstore"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 hover:scale-110 transition-all"
          >
            <FaFacebook />
          </a>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-500 hover:scale-110 transition-all"
          >
            <FaWhatsapp />
          </a>
        </div>
      </footer>
    </div>
  );
}
