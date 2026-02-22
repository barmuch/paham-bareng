'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff,
  FiSearch, FiStar
} from 'react-icons/fi';

export default function AdminRoadmaps() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRoadmaps();
  }, [search]);

  const fetchRoadmaps = async () => {
    try {
      const { data } = await adminAPI.getRoadmaps({ search, limit: 100 });
      const roadmapsList = data.data?.roadmaps || data.data || data.roadmaps || [];
      setRoadmaps(Array.isArray(roadmapsList) ? roadmapsList : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: string, isPublished: boolean) => {
    try {
      await adminAPI.publishRoadmap(id, !isPublished);
      toast.success(isPublished ? 'Unpublished' : 'Published');
      fetchRoadmaps();
    } catch {
      toast.error('Failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this roadmap? This cannot be undone.')) return;
    try {
      await adminAPI.deleteRoadmap(id);
      toast.success('Roadmap deleted');
      fetchRoadmaps();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 mb-1">Roadmap Management</h1>
          <p className="text-dark-500">Create, edit, and manage learning roadmaps</p>
        </div>
        <Link href="/admin/roadmaps/editor" className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Create Roadmap
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
        <input
          type="text"
          placeholder="Search roadmaps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field !pl-10"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-50 border-b border-dark-200">
            <tr>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Roadmap</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Category</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Nodes</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Views</th>
              <th className="text-right text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-dark-400">Loading...</td></tr>
            ) : roadmaps.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-dark-400">No roadmaps found</td></tr>
            ) : (
              roadmaps.map((rm) => (
                <tr key={rm._id} className="hover:bg-dark-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{rm.icon}</span>
                      <div>
                        <p className="font-medium text-dark-900">{rm.title}</p>
                        <p className="text-xs text-dark-500">v{rm.version || 1}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge bg-dark-100 text-dark-600">{rm.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-600">{rm.nodes?.length || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${rm.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {rm.isPublished ? 'Published' : 'Draft'}
                    </span>
                    {rm.isFeatured && (
                      <FiStar className="inline ml-2 text-yellow-500" size={14} />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-600">{rm.views || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/roadmaps/editor?id=${rm._id}`}
                        className="p-2 hover:bg-primary-50 rounded-lg text-primary-600 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </Link>
                      <button
                        onClick={() => togglePublish(rm._id, rm.isPublished)}
                        className="p-2 hover:bg-dark-100 rounded-lg text-dark-600 transition-colors"
                        title={rm.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        {rm.isPublished ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(rm._id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
