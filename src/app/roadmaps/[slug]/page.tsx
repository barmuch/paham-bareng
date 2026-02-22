'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RoadmapGraph from '@/components/RoadmapGraph';
import { roadmapsAPI, progressAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import {
  FiCheckCircle, FiClock, FiPlay, FiSkipForward,
  FiExternalLink, FiX, FiHeart, FiEye, FiBookOpen
} from 'react-icons/fi';

export default function RoadmapDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { isAuthenticated } = useAuthStore();

  const [roadmap, setRoadmap] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: roadmapData } = await roadmapsAPI.getBySlug(slug);
        setRoadmap(roadmapData.data);

        if (isAuthenticated) {
          try {
            const { data: progressData } = await progressAPI.getByRoadmap(roadmapData.data._id);
            setProgress(progressData.data);
          } catch {}
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchData();
  }, [slug, isAuthenticated]);

  const handleNodeClick = useCallback((nodeId: string, node: any) => {
    setSelectedNode(node);
    setShowPanel(true);
  }, []);

  const updateNodeStatus = async (status: string) => {
    if (!isAuthenticated || !roadmap || !selectedNode) {
      toast.error('Please login to track progress');
      return;
    }

    try {
      const { data } = await progressAPI.updateNode(roadmap._id, selectedNode.id, { status });
      setProgress(data.data);
      toast.success(`Marked as ${status.replace('-', ' ')}`);
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const getNodeStatus = (nodeId: string) => {
    if (!progress?.nodeProgress) return 'not-started';
    const p = progress.nodeProgress.find((n: any) => n.nodeId === nodeId);
    return p?.status || 'not-started';
  };

  const completedCount = progress?.nodeProgress?.filter((n: any) => n.status === 'completed').length || 0;
  const totalNodes = roadmap?.nodes?.length || 0;
  const progressPercent = totalNodes > 0 ? Math.round((completedCount / totalNodes) * 100) : 0;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-dark-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-dark-200 rounded w-2/3 mx-auto mb-8"></div>
            <div className="h-96 bg-dark-100 rounded-xl"></div>
          </div>
        </div>
      </>
    );
  }

  if (!roadmap) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-dark-700 mb-2">Roadmap Not Found</h1>
          <p className="text-dark-500">The roadmap you&apos;re looking for doesn&apos;t exist.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-5xl">{roadmap.icon}</span>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-dark-900 mb-2">{roadmap.title}</h1>
              <p className="text-dark-500 mb-3">{roadmap.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-dark-500">
                <span className="flex items-center gap-1">
                  <FiClock size={14} /> {roadmap.estimatedHours}{roadmap.estimatedTimeUnit === 'minutes' ? 'm' : 'h'} total
                </span>
                <span className="flex items-center gap-1"><FiEye size={14} /> {roadmap.views} views</span>
                <span className="flex items-center gap-1"><FiHeart size={14} /> {roadmap.likes} likes</span>
                <span className="flex items-center gap-1"><FiBookOpen size={14} /> {roadmap.nodes.length} topics</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {isAuthenticated && progress && (
            <div className="card p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-dark-700">Your Progress</span>
                <span className="text-sm font-bold text-primary-600">{progressPercent}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill bg-gradient-to-r from-primary-500 to-primary-600"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-dark-500 mt-2">{completedCount} of {totalNodes} topics completed</p>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {roadmap.tags.map((tag: string) => (
              <span key={tag} className="text-xs px-2.5 py-1 bg-dark-100 text-dark-600 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Graph */}
        <div className="w-full">
          <RoadmapGraph
            nodes={roadmap.nodes}
            edges={roadmap.edges}
            progress={progress?.nodeProgress}
            onNodeClick={handleNodeClick}
            interactive
          />
        </div>

        {/* Node Detail Panel */}
        {showPanel && selectedNode && (
          <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl border-l border-dark-200 z-50 overflow-y-auto animate-slide-in">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="badge bg-primary-100 text-primary-700 mb-2">{selectedNode.type}</span>
                  <h2 className="text-xl font-bold text-dark-900">{selectedNode.label}</h2>
                </div>
                <button onClick={() => setShowPanel(false)} className="p-2 hover:bg-dark-100 rounded-lg">
                  <FiX size={20} />
                </button>
              </div>

              {selectedNode.description && (
                <p className="text-sm text-dark-600 leading-relaxed mb-6">{selectedNode.description}</p>
              )}

              {selectedNode.estimatedHours > 0 && (
                <div className="flex items-center gap-2 text-sm text-dark-500 mb-6">
                  <FiClock size={14} />
                  <span>
                    Estimated: {selectedNode.estimatedHours} {selectedNode.estimatedTimeUnit === 'minutes' ? 'minutes' : 'hours'}
                  </span>
                </div>
              )}

              {/* Status Buttons */}
              {isAuthenticated && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-dark-700 mb-3">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateNodeStatus('in-progress')}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                        getNodeStatus(selectedNode.id) === 'in-progress'
                          ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                          : 'border-dark-200 hover:bg-dark-50 text-dark-600'
                      }`}
                    >
                      <FiPlay size={14} /> In Progress
                    </button>
                    <button
                      onClick={() => updateNodeStatus('completed')}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                        getNodeStatus(selectedNode.id) === 'completed'
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : 'border-dark-200 hover:bg-dark-50 text-dark-600'
                      }`}
                    >
                      <FiCheckCircle size={14} /> Done
                    </button>
                    <button
                      onClick={() => updateNodeStatus('skipped')}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                        getNodeStatus(selectedNode.id) === 'skipped'
                          ? 'bg-gray-200 border-gray-300 text-gray-700'
                          : 'border-dark-200 hover:bg-dark-50 text-dark-600'
                      }`}
                    >
                      <FiSkipForward size={14} /> Skip
                    </button>
                    <button
                      onClick={() => updateNodeStatus('not-started')}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border border-dark-200 hover:bg-dark-50 text-dark-600`}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {/* Resources */}
              {selectedNode.resources && selectedNode.resources.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-dark-700 mb-3">Learning Resources</p>
                  <div className="space-y-2">
                    {selectedNode.resources.map((res: any, idx: number) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-dark-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
                      >
                        <span className="text-xs px-2 py-0.5 rounded bg-dark-100 text-dark-600 uppercase font-medium">
                          {res.type}
                        </span>
                        <span className="text-sm text-dark-700 flex-grow group-hover:text-primary-700">{res.title}</span>
                        <FiExternalLink size={14} className="text-dark-400 group-hover:text-primary-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
