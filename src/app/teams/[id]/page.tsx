'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { teamsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import {
  FiUsers, FiMap, FiCopy, FiBarChart2, FiUserMinus,
  FiTrendingUp, FiClock
} from 'react-icons/fi';

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params?.id as string;
  const { user } = useAuthStore();

  const [team, setTeam] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'roadmaps' | 'progress'>('members');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: teamData } = await teamsAPI.getById(teamId);
        setTeam(teamData.data);

        try {
          const { data: progressData } = await teamsAPI.getProgress(teamId);
          setProgress(progressData.data);
        } catch {}
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    if (teamId) fetchData();
  }, [teamId]);

  const copyInviteCode = () => {
    if (team?.inviteCode) {
      navigator.clipboard.writeText(team.inviteCode);
      toast.success('Invite code copied!');
    }
  };

  const isAdmin = team?.members?.some(
    (m: any) => m.user._id === user?.id && ['owner', 'admin'].includes(m.role)
  );

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      await teamsAPI.removeMember(teamId, userId);
      toast.success('Member removed');
      const { data } = await teamsAPI.getById(teamId);
      setTeam(data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="animate-pulse">
            <div className="h-8 bg-dark-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-dark-200 rounded w-2/3 mb-8"></div>
            <div className="h-64 bg-dark-100 rounded-xl"></div>
          </div>
        </div>
      </>
    );
  }

  if (!team) {
    return (
      <>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-dark-700">Team Not Found</h1>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="card p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-dark-900 mb-2">{team.name}</h1>
              {team.description && <p className="text-dark-500">{team.description}</p>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={copyInviteCode} className="btn-secondary flex items-center gap-2 text-sm">
                <FiCopy size={14} />
                <span className="font-mono">{team.inviteCode}</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-dark-500">
            <span className="flex items-center gap-1"><FiUsers size={14} /> {team.members?.length} members</span>
            <span className="flex items-center gap-1"><FiMap size={14} /> {team.roadmaps?.length} roadmaps</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-dark-100 p-1 rounded-lg w-fit">
          {(['members', 'roadmaps', 'progress'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                activeTab === tab ? 'bg-white shadow-sm text-dark-900' : 'text-dark-500 hover:text-dark-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-3">
            {team.members?.map((member: any) => (
              <div key={member.user._id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
                    {member.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-dark-900">{member.user.name}</p>
                    <p className="text-xs text-dark-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${member.role === 'owner' ? 'bg-primary-100 text-primary-700' : member.role === 'admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-dark-100 text-dark-600'}`}>
                    {member.role}
                  </span>
                  {isAdmin && member.role !== 'owner' && member.user._id !== user?.id && (
                    <button onClick={() => handleRemoveMember(member.user._id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                      <FiUserMinus size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Roadmaps Tab */}
        {activeTab === 'roadmaps' && (
          <div className="space-y-3">
            {team.roadmaps?.length === 0 ? (
              <div className="text-center py-10 card">
                <FiMap className="mx-auto text-dark-300 mb-3" size={36} />
                <p className="text-dark-500">No roadmaps assigned yet</p>
              </div>
            ) : (
              team.roadmaps?.map((tr: any) => (
                <div key={tr.roadmap._id} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tr.roadmap.icon}</span>
                    <div>
                      <p className="font-medium text-dark-900">{tr.roadmap.title}</p>
                      <p className="text-xs text-dark-500">{tr.roadmap.category} • {tr.isRequired ? 'Required' : 'Optional'}</p>
                    </div>
                  </div>
                  {tr.deadline && (
                    <span className="text-xs text-dark-500 flex items-center gap-1">
                      <FiClock size={12} /> Due: {new Date(tr.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && progress && (
          <div className="space-y-6">
            {/* Skill Gaps */}
            {progress.skillGaps && Object.keys(progress.skillGaps).length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center gap-2">
                  <FiBarChart2 /> Skill Gap Analysis
                </h3>
                <div className="space-y-4">
                  {Object.entries(progress.skillGaps).map(([name, data]: [string, any]) => (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-dark-700">{name}</span>
                        <span className="text-sm text-dark-500">{data.averageCompletion}% avg</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill bg-primary-500"
                          style={{ width: `${data.averageCompletion}%` }}
                        />
                      </div>
                      <p className="text-xs text-dark-400 mt-1">{data.membersStarted}/{data.totalMembers} members started</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Member Progress */}
            {progress.memberProgress?.map((mp: any) => (
              <div key={mp.user._id} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                      {mp.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-dark-900">{mp.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiTrendingUp size={14} className="text-primary-500" />
                    <span className="text-sm font-medium text-primary-600">{mp.averageProgress}%</span>
                  </div>
                </div>
                <div className="progress-bar mb-1">
                  <div className="progress-bar-fill bg-primary-500" style={{ width: `${mp.averageProgress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
