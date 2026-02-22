'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  FiSearch, FiTrash2, FiUsers, FiMap
} from 'react-icons/fi';

export default function AdminTeams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTeams();
  }, [search]);

  const fetchTeams = async () => {
    try {
      const { data } = await adminAPI.getTeams({ search, limit: 100 });
      const teamsList = data.data?.teams || data.data || data.teams || [];
      setTeams(Array.isArray(teamsList) ? teamsList : []);
    } catch {
      console.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this team permanently?')) return;
    try {
      await adminAPI.deleteTeam(id);
      toast.success('Team deleted');
      fetchTeams();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-900 mb-1">Team Management</h1>
        <p className="text-dark-500">View and manage learning teams</p>
      </div>

      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field !pl-10"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-dark-900">{teams.length}</p>
          <p className="text-sm text-dark-500">Total Teams</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">
            {teams.reduce((sum, t) => sum + (t.members?.length || 0), 0)}
          </p>
          <p className="text-sm text-dark-500">Total Members</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {teams.reduce((sum, t) => sum + (t.roadmaps?.length || 0), 0)}
          </p>
          <p className="text-sm text-dark-500">Assigned Roadmaps</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-50 border-b border-dark-200">
            <tr>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Team</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Owner</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Members</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Roadmaps</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Invite Code</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Created</th>
              <th className="text-right text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-dark-400">Loading...</td></tr>
            ) : teams.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-dark-400">No teams found</td></tr>
            ) : (
              teams.map(team => (
                <tr key={team._id} className="hover:bg-dark-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-dark-900">{team.name}</p>
                    <p className="text-xs text-dark-500 line-clamp-1">{team.description}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-600">
                    {team.owner?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <FiUsers size={14} className="text-dark-400" />
                      <span className="text-sm text-dark-600">{team.members?.length || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <FiMap size={14} className="text-dark-400" />
                      <span className="text-sm text-dark-600">{team.roadmaps?.length || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-dark-100 px-2 py-1 rounded font-mono">{team.inviteCode}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-500">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(team._id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-500"
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
