'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RoadmapCard from '@/components/RoadmapCard';
import { roadmapsAPI } from '@/lib/api';
import { FiSearch, FiFilter } from 'react-icons/fi';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'aqidah', label: 'Aqidah / Tauhid' },
  { value: 'fiqh', label: 'Fiqh Ibadah' },
  { value: 'sirah', label: 'Sirah Nabawiyah' },
  { value: 'quran', label: 'Al-Qur’an' },
  { value: 'hadith', label: 'Hadits' },
];


export default function RoadmapsClient() {
  const searchParams = useSearchParams();
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams?.get('category') || '');

  useEffect(() => {
    const fetchRoadmaps = async () => {
      setLoading(true);
      try {
        const params: any = { limit: 50 };
        if (category) params.category = category;
        if (search) params.search = search;

        const { data } = await roadmapsAPI.getAll(params);
        // API returns array directly in data field
        setRoadmaps(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error('Error:', error);
        setRoadmaps([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmaps();
  }, [category, search]);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-dark-900 mb-3">Roadmap Pembelajaran Islam</h1>
          <p className="text-lg text-dark-500 max-w-2xl mx-auto">
            Kumpulan roadmap tematik untuk belajar bertahap: dari dasar sampai penguatan
          </p>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
              <input
                type="text"
                placeholder="Cari roadmap... (contoh: tauhid, shalat, tajwid)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field !pl-10"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field sm:w-48"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="w-10 h-10 bg-dark-200 rounded mb-3"></div>
                <div className="h-5 bg-dark-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-dark-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-dark-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="text-center py-20">
            <FiFilter className="mx-auto text-dark-300 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-dark-700 mb-2">No roadmaps found</h3>
            <p className="text-dark-500">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map((roadmap) => (
              <RoadmapCard key={roadmap._id} roadmap={roadmap} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
