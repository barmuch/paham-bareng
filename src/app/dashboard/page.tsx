'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { progressAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { FiMap, FiCheckCircle, FiTrendingUp, FiClock, FiArrowRight } from 'react-icons/fi';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, isLoading]);

  const fetchData = async () => {
    try {
      const [statsRes, progressRes] = await Promise.all([
        progressAPI.getStats(),
        progressAPI.getAll(),
      ]);
      setStats(statsRes.data.data || statsRes.data || {});
      const progressData = progressRes.data.data?.progress || progressRes.data.data || progressRes.data.progress || [];
      setProgressList(Array.isArray(progressData) ? progressData : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-dark-200 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-dark-100 rounded-xl"></div>)}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-dark-900 mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-dark-500 mb-8">Here&apos;s your learning progress overview</p>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="card p-5 text-center">
              <FiMap className="mx-auto text-primary-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-dark-900">{stats.totalRoadmaps}</p>
              <p className="text-xs text-dark-500">Roadmaps Started</p>
            </div>
            <div className="card p-5 text-center">
              <FiCheckCircle className="mx-auto text-green-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-dark-900">{stats.completedRoadmaps}</p>
              <p className="text-xs text-dark-500">Completed</p>
            </div>
            <div className="card p-5 text-center">
              <FiTrendingUp className="mx-auto text-yellow-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-dark-900">{stats.averageProgress}%</p>
              <p className="text-xs text-dark-500">Avg Progress</p>
            </div>
            <div className="card p-5 text-center">
              <FiClock className="mx-auto text-purple-500 mb-2" size={24} />
              <p className="text-2xl font-bold text-dark-900">{Math.round((stats.totalTimeSpentMinutes || 0) / 60)}h</p>
              <p className="text-xs text-dark-500">Time Spent</p>
            </div>
          </div>
        )}

        {/* Progress List */}
        <h2 className="text-xl font-semibold text-dark-900 mb-4">Your Roadmaps</h2>
        {progressList.length === 0 ? (
          <div className="card p-10 text-center">
            <FiMap className="mx-auto text-dark-300 mb-3" size={36} />
            <p className="text-dark-500 mb-4">You haven&apos;t started any roadmaps yet</p>
            <Link href="/roadmaps" className="btn-primary inline-flex items-center gap-2">
              Browse Roadmaps <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {progressList.map((p) => (
              <Link key={p._id} href={`/roadmaps/${p.roadmap?.slug}`} className="block group">
                <div className="card p-5 group-hover:border-primary-300">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{p.roadmap?.icon || '🗺️'}</span>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-dark-900 group-hover:text-primary-600">{p.roadmap?.title}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-grow progress-bar">
                          <div className="progress-bar-fill bg-primary-500" style={{ width: `${p.percentage}%` }} />
                        </div>
                        <span className="text-sm font-bold text-primary-600 w-12 text-right">{p.percentage}%</span>
                      </div>
                    </div>
                    <FiArrowRight className="text-dark-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
