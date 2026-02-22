'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { teamsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { FiPlus, FiUsers, FiMap, FiLink, FiArrowRight } from 'react-icons/fi';

export default function TeamsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchTeams();
  }, [isAuthenticated]);

  const fetchTeams = async () => {
    try {
      const { data } = await teamsAPI.getAll();
      const teamsList = data.data?.teams || data.data || data.teams || [];
      setTeams(Array.isArray(teamsList) ? teamsList : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await teamsAPI.create(createForm);
      toast.success('Team created!');
      setShowCreate(false);
      setCreateForm({ name: '', description: '' });
      fetchTeams();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await teamsAPI.join(inviteCode);
      toast.success('Joined team!');
      setShowJoin(false);
      setInviteCode('');
      fetchTeams();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid invite code');
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <FiUsers className="mx-auto text-dark-300 mb-4" size={48} />
          <h1 className="text-3xl font-bold text-dark-900 mb-3">Team Learning</h1>
          <p className="text-dark-500 mb-8">Login to create teams, assign roadmaps, and track your team&apos;s progress together.</p>
          <Link href="/auth/login" className="btn-primary">Login to Get Started</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-900 mb-2">Your Teams</h1>
            <p className="text-dark-500">Collaborate and track learning progress together</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowJoin(true)} className="btn-secondary flex items-center gap-2">
              <FiLink size={16} /> Join Team
            </button>
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <FiPlus size={16} /> Create Team
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-6 bg-dark-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-dark-200 rounded w-2/3 mb-4"></div>
                <div className="h-3 bg-dark-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-20 card">
            <FiUsers className="mx-auto text-dark-300 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-dark-700 mb-2">No teams yet</h3>
            <p className="text-dark-500 mb-6">Create a team or join one with an invite code</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">Create Your First Team</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team) => (
              <Link key={team._id} href={`/teams/${team._id}`} className="block group">
                <div className="card p-6 group-hover:border-primary-300 group-hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-dark-900 group-hover:text-primary-600">{team.name}</h3>
                    <span className="badge bg-dark-100 text-dark-600">
                      <FiUsers size={12} className="mr-1" /> {team.members?.length || 0}
                    </span>
                  </div>
                  {team.description && (
                    <p className="text-sm text-dark-500 mb-4 line-clamp-2">{team.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-dark-500">
                      <FiMap size={14} />
                      <span>{team.roadmaps?.length || 0} roadmaps</span>
                    </div>
                    <span className="text-primary-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      View <FiArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
              <h2 className="text-xl font-bold text-dark-900 mb-4">Create Team</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Team Name</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Frontend Squad"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="What is this team about?"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Modal */}
        {showJoin && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
              <h2 className="text-xl font-bold text-dark-900 mb-4">Join Team</h2>
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Invite Code</label>
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="input-field text-center font-mono text-lg tracking-widest"
                    placeholder="ABCDEF123"
                    maxLength={11}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowJoin(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Join</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
