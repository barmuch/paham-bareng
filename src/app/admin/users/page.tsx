'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  FiSearch, FiShield, FiUser, FiStar, FiMoreVertical
} from 'react-icons/fi';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const { data } = await adminAPI.getUsers({ search, limit: 100 });
      const usersList = data.data?.users || data.data || data.users || [];
      setUsers(Array.isArray(usersList) ? usersList : []);
    } catch {
      console.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, role: string) => {
    try {
      await adminAPI.updateUserRole(userId, role);
      toast.success(`Role updated to ${role}`);
      fetchUsers();
    } catch {
      toast.error('Failed');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-900 mb-1">User Management</h1>
        <p className="text-dark-500">Manage user accounts and roles</p>
      </div>

      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field !pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-dark-900">{users.length}</p>
          <p className="text-sm text-dark-500">Total Users</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{users.filter(u => u.role === 'admin').length}</p>
          <p className="text-sm text-dark-500">Admins</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{users.filter(u => u.isPremium).length}</p>
          <p className="text-sm text-dark-500">Premium</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-50 border-b border-dark-200">
            <tr>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">User</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Role</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Premium</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Skills</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Joined</th>
              <th className="text-right text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-dark-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-dark-400">No users found</td></tr>
            ) : (
              users.map(user => (
                <tr key={user._id} className="hover:bg-dark-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-sm">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-dark-900">{user.name}</p>
                        <p className="text-xs text-dark-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user._id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-dark-100 text-dark-600'
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {user.isPremium ? (
                      <span className="badge bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit">
                        <FiStar size={10} /> Premium
                      </span>
                    ) : (
                      <span className="text-xs text-dark-400">Free</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(user.skills || []).slice(0, 3).map((s: string, i: number) => (
                        <span key={i} className="badge bg-dark-100 text-dark-600 !text-[10px]">{s}</span>
                      ))}
                      {(user.skills?.length || 0) > 3 && (
                        <span className="text-[10px] text-dark-400">+{user.skills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                      >
                        Delete
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
