import Image from "next/image";

export default function SIPSLogo() {
  return (
    <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/30 shadow-md">
      <Image
        src="/logooyako.jpg"
        alt="Logo Warung Oyako"
        fill
        sizes="48px"
        className="object-cover"
      />
    </div>
  );
}
