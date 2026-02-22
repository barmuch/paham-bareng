'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RoadmapCard from '@/components/RoadmapCard';
import HeroAnimation from '@/components/HeroAnimation';
import { roadmapsAPI } from '@/lib/api';
import { FiArrowRight, FiMap, FiHeart, FiUsers, FiBook, FiCompass, FiStar } from 'react-icons/fi';

export default function HomePage() {
  const [featuredRoadmaps, setFeaturedRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await roadmapsAPI.getAll({ featured: 'true', limit: 6 });
        // API returns array directly in data field
        setFeaturedRoadmaps(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error('Error fetching roadmaps:', error);
        setFeaturedRoadmaps([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = [
    { 
      name: 'Aqidah / Tauhid', 
      slug: 'aqidah', 
      icon: '🕌', 
      desc: 'Fondasi iman dan prinsip-prinsip tauhid', 
      color: 'bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100' 
    },
    { 
      name: 'Fiqh Ibadah', 
      slug: 'fiqh', 
      icon: '📿', 
      desc: 'Panduan praktik ibadah harian bertahap', 
      color: 'bg-accent-mustard-50 border-accent-mustard-200 text-accent-mustard-700 hover:bg-accent-mustard-100' 
    },
    { 
      name: 'Sirah Nabawiyah', 
      slug: 'sirah', 
      icon: '📖', 
      desc: 'Belajar sejarah Nabi ﷺ dan pelajarannya', 
      color: 'bg-accent-sand-50 border-accent-sand-200 text-accent-sand-700 hover:bg-accent-sand-100' 
    },
    { 
      name: 'Al-Qur\'an', 
      slug: 'quran', 
      icon: '📗', 
      desc: 'Tilawah, tajwid, hafalan, dan tadabbur', 
      color: 'bg-primary-100 border-primary-300 text-primary-800 hover:bg-primary-200' 
    },
  ];

  const features = [
    { icon: FiCompass, title: 'Tumbuh Sesuai Porsimu', desc: 'Tidak perlu terburu-buru. Peta belajar di sini dirancang bertahap. Kamu bisa mengatur kecepatan belajarmu sendiri.' },
    { icon: FiUsers, title: 'Ruang Aman untuk Bertanya', desc: 'Tinggalkan rasa takut salah. Di sini kita diskusi untuk mencari pemahaman, bukan mencari siapa yang paling benar.' },
    { icon: FiMap, title: 'Rute yang Jelas & Terarah', desc: 'Materi yang terstruktur membantumu melihat gambaran besar ilmu Islam' },
  ];

  return (
    <>
      <Navbar />
      
      {/* Full page animated background */}
      <HeroAnimation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream via-[#f5f2ed] to-warm-50 text-warm-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <p className="italic text-warm-700 mb-6 text-base sm:text-lg">
              Tenang saja, Rabb Yang Maha Penyayang tak akan menyia-nyiakan usaha hamba yang mencari kebenaran.
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading mb-6 leading-tight text-warm-900">
              Paham Bareng: <span className="text-primary-600">Ruang Belajar Tanpa Syarat</span>, Bertumbuh Tanpa Sekat.
            </h1>
            <p className="text-lg sm:text-xl text-warm-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/roadmaps" className="btn-primary !px-8 !py-3.5 text-lg inline-flex items-center gap-2 justify-center shadow-lg hover:shadow-xl">
                Lihat Peta Belajar <FiArrowRight />
              </Link>
              <Link href="/auth/register" className="bg-white/80 backdrop-blur-sm hover:bg-white text-primary-700 px-8 py-3.5 rounded-xl font-medium transition-all text-lg text-center border border-primary-200 hover:border-primary-300 shadow-sm hover:shadow-md">
                Mulai Langkah Pertamamu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="section-title">Pilih Peta Belajarmu</h2>
          <p className="section-subtitle">Jalur pembelajaran yang terstruktur untuk berbagai topik ilmu Islam</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/roadmaps?category=${cat.slug}`}
              className={`p-5 rounded-2xl border-2 ${cat.color} hover:-translate-y-1 transition-all duration-300 block`}
            >
              <span className="text-3xl mb-3 block">{cat.icon}</span>
              <h3 className="font-semibold font-heading mb-1">{cat.name}</h3>
              <p className="text-sm opacity-80">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Roadmaps */}
      <section className="relative z-10 bg-dark-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title">Peta Belajar Populer</h2>
              <p className="text-lg text-warm-600">Roadmap yang paling banyak diikuti</p>
            </div>
            <Link href="/roadmaps" className="btn-secondary hidden sm:inline-flex items-center gap-2">
              Lihat Semua <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="w-10 h-10 bg-dark-200 rounded mb-3"></div>
                  <div className="h-5 bg-dark-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-dark-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-dark-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRoadmaps.length > 0 ? (
                featuredRoadmaps.map((roadmap) => (
                  <RoadmapCard key={roadmap._id} roadmap={roadmap} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-warm-400 mb-4">
                    <FiMap size={48} className="mx-auto mb-3" />
                    <p className="text-lg">Belum ada roadmap tersedia</p>
                    <p className="text-sm">Segera hadir peta belajar yang menarik!</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link href="/roadmaps" className="btn-secondary inline-flex items-center gap-2">
              Lihat Semua Roadmap <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="relative z-10 bg-primary-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title">Kenapa Kita Harus Paham Bareng?</h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-warm-700 leading-relaxed mb-4">
              Seringkali kita merasa tertinggal. Merasa ilmu agama itu terlalu luas dan kita tidak tahu harus mulai dari mana.
            </p>
            <p className="text-warm-700 leading-relaxed mb-4">
              Komunitas ini dibangun dengan satu keyakinan sederhana: <strong className="text-primary-700">Tidak ada kata terlambat untuk belajar, dan tidak ada pertanyaan yang terlalu bodoh.</strong>
            </p>
            <p className="text-warm-700 leading-relaxed">
              Kita menggunakan peta jalan (roadmap) agar belajarnya terarah dan mudah. Kamu tidak sendirian di jalan ini. Mari berproses bersama.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="section-title">Yang Kamu Dapatkan di Sini</h2>
          <p className="section-subtitle">Belajar dengan cara yang nyaman dan menyenangkan</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div key={i} className="card p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mb-4 text-primary-600">
                <feat.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold font-heading text-dark-900 mb-2">{feat.title}</h3>
              <p className="text-sm text-warm-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {/* <section className="relative z-10 bg-primary-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-heading mb-4">Mulai Langkah Pertamamu Hari Ini</h2>
          <p className="text-primary-100 text-lg mb-8">
            Bergabunglah dengan komunitas yang menghargai setiap usahamu dalam mencari ilmu agama.
          </p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-50 transition-all text-lg">
            Daftar Gratis <FiArrowRight />
          </Link>
        </div>
      </section> */}

      <Footer />
    </>
  );
}
