import Link from 'next/link';
import Image from 'next/image';
import { FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-dark-950 text-dark-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Image src="/logo.png" alt="Paham Bareng" width={28} height={28} className="object-contain" />
              <span className="font-heading">paham-<span className="text-primary-400">bareng</span></span>
            </Link>
            <p className="text-sm text-dark-500 leading-relaxed max-w-md">
              Diseduh dengan semangat belajar bersama di paham-bareng.id. Semoga Allah memberkahi langkah kita.
            </p>
          </div>

          {/* Kategori Roadmaps */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Peta Belajar</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/roadmaps?category=aqidah" className="hover:text-white transition-colors">Aqidah / Tauhid</Link></li>
              <li><Link href="/roadmaps?category=fiqh" className="hover:text-white transition-colors">Fiqh Ibadah</Link></li>
              <li><Link href="/roadmaps?category=sirah" className="hover:text-white transition-colors">Sirah Nabawiyah</Link></li>
              <li><Link href="/roadmaps?category=quran" className="hover:text-white transition-colors">Al-Qur'an</Link></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Mulai</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/roadmaps" className="hover:text-white transition-colors">Semua Roadmap</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Masuk</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition-colors">Daftar</Link></li>
            </ul>
          </div>
        </div>

        <hr className="border-dark-800 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-dark-500 flex items-center gap-1">
            Dibuat dengan <FiHeart className="text-red-500" size={12} /> untuk para pencari ilmu
          </p>
          <p className="text-xs text-dark-500">
            © 2026 paham-bareng.id
          </p>
        </div>
      </div>
    </footer>
  );
}
