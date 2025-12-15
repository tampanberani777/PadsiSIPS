import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPinIcon } from "@heroicons/react/24/outline";

export default function StoreProfilePage() {
  return (
    <div className="relative w-full h-screen">
      {/* Background foto toko */}
      <div className="absolute inset-0">
        <Image
          src="/warungoyako.jpg"
          alt="Warung Oyako"
          fill
          className="object-cover brightness-75"
        />
      </div>

      {/* Overlay teks di tengah */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
        <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-lg">
          WARUNG OYAKO
        </h1>
        <p className="text-lg md:text-xl mt-3 font-light">
          Comfort Japaneese Food
        </p>
      </div>
    </div>
  );
}

