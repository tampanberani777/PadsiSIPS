import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';

export default function RanggaGamingLogo() {
  return (
    <div className={`${lusitana.className} flex items-center leading-none`}>
      <Image
        src="/logooyako.jpg" // Ganti sesuai nama file Anda di folder public
        alt="Rangga Gaming Store Logo"
        width={90}  // Sesuaikan ukuran
        height={90} // Sesuaikan ukuran
        className="object-contain"
      />
    </div>
  );
}
