import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiMap } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-sand-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-2xl text-dark-900">
            <span className="text-3xl">🌱</span>
            <span className="font-heading">paham-<span className="text-primary-500">bareng</span></span>
          </Link>
        </div>

        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-accent-mustard-100 rounded-full mb-6">
            <FiMap size={48} className="text-accent-mustard-600" />
          </div>
          <h1 className="text-7xl font-bold font-heading text-primary-700 mb-4">404</h1>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-dark-900 mb-4">
            Wah, sepertinya kamu salah belok
          </h2>
          <p className="text-lg text-warm-600 leading-relaxed max-w-lg mx-auto">
            Tenang, orang yang mencari kebenaran memang kadang nyasar sedikit. 
            Yuk kembali ke peta utama dan mulai lagi dari jalan yang benar.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/roadmaps" 
            className="btn-primary inline-flex items-center gap-2 justify-center !px-8 !py-3"
          >
            <FiMap size={18} />
            Kembali ke Peta Utama
          </Link>
          <Link 
            href="/" 
            className="btn-secondary inline-flex items-center gap-2 justify-center !px-8 !py-3"
          >
            <FiArrowLeft size={18} />
            Ke Halaman Utama
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-warm-200">
          <p className="text-sm text-warm-600">
            Butuh bantuan? Pastikan URL yang kamu masukkan sudah benar, atau{' '}
            <Link href="/roadmaps" className="text-primary-600 hover:text-primary-700 font-medium underline">
              jelajahi roadmap kami
            </Link>
            {' '}untuk menemukan yang kamu cari.
          </p>
        </div>
      </div>
    </div>
  );
}
