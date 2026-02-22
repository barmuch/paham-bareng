'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminAPI } from '@/lib/api';
import { FiUsers, FiMap, FiCode, FiTrendingUp, FiArrowRight } from 'react-icons/fi';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: res } = await adminAPI.getDashboard();
        setData(res.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-dark-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: data?.totalUsers || 0, icon: FiUsers, color: 'bg-blue-50 text-blue-600', link: '/admin/users' },
    { label: 'Roadmaps', value: data?.totalRoadmaps || 0, icon: FiMap, color: 'bg-purple-50 text-purple-600', link: '/admin/roadmaps' },
    { label: 'Projects', value: data?.totalProjects || 0, icon: FiCode, color: 'bg-green-50 text-green-600', link: '/admin/projects' },
    { label: 'Active This Week', value: data?.activeLearnersThisWeek || 0, icon: FiTrendingUp, color: 'bg-yellow-50 text-yellow-600', link: '/admin/users' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-900 mb-1">Dashboard</h1>
        <p className="text-dark-500">Overview of your platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.link} className="card p-5 group hover:border-primary-300">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon size={20} />
              </div>
              <FiArrowRight className="text-dark-300 group-hover:text-primary-500 transition-colors" size={16} />
            </div>
            <p className="text-3xl font-bold text-dark-900">{stat.value}</p>
            <p className="text-sm text-dark-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-dark-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link href="/admin/roadmaps/editor" className="card p-5 text-center hover:border-primary-300 group">
          <FiMap className="mx-auto text-primary-500 mb-2" size={28} />
          <p className="font-semibold text-dark-900 group-hover:text-primary-600">Create Roadmap</p>
          <p className="text-xs text-dark-500 mt-1">Use the visual editor</p>
        </Link>
        <Link href="/admin/projects" className="card p-5 text-center hover:border-primary-300 group">
          <FiCode className="mx-auto text-green-500 mb-2" size={28} />
          <p className="font-semibold text-dark-900 group-hover:text-primary-600">Add Project</p>
          <p className="text-xs text-dark-500 mt-1">Create new project idea</p>
        </Link>
        <Link href="/admin/users" className="card p-5 text-center hover:border-primary-300 group">
          <FiUsers className="mx-auto text-purple-500 mb-2" size={28} />
          <p className="font-semibold text-dark-900 group-hover:text-primary-600">Manage Users</p>
          <p className="text-xs text-dark-500 mt-1">View and manage accounts</p>
        </Link>
      </div>

      {/* Recent Users */}
      {data?.recentUsers && (
        <div>
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Recent Users</h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark-50 border-b border-dark-200">
                <tr>
                  <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Role</th>
                  <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {data.recentUsers.map((user: any) => (
                  <tr key={user._id} className="hover:bg-dark-50">
                    <td className="px-6 py-3 text-sm font-medium text-dark-900">{user.name}</td>
                    <td className="px-6 py-3 text-sm text-dark-500">{user.email}</td>
                    <td className="px-6 py-3">
                      <span className={`badge ${user.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-dark-100 text-dark-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-dark-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
