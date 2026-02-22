'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { projectsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { FiSearch, FiFilter } from 'react-icons/fi';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'devops', label: 'DevOps' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'ai-ml', label: 'AI & ML' },
];

export default function ProjectsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (category) params.category = category;
        if (search) params.search = search;

        const { data } = await projectsAPI.getAll(params);
        const projectsList = data.data?.projects || data.data || data.projects || [];
        setProjects(Array.isArray(projectsList) ? projectsList : []);

        // Check completed state
        if (isAuthenticated && user) {
          const ids = new Set<string>(
            data.data
              .filter((p: any) => p.completedBy?.includes(user.id))
              .map((p: any) => p._id)
          );
          setCompletedIds(ids);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [category, search, isAuthenticated, user]);

  const handleToggleComplete = async (projectId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to track projects');
      return;
    }
    try {
      const { data } = await projectsAPI.toggleComplete(projectId);
      setCompletedIds(prev => {
        const next = new Set(prev);
        if (data.completed) next.add(projectId);
        else next.delete(projectId);
        return next;
      });
      toast.success(data.completed ? 'Project marked as completed!' : 'Project unmarked');
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-dark-900 mb-3">Project Ideas</h1>
          <p className="text-lg text-dark-500 max-w-2xl mx-auto">
            Praktikkan keterampilanmu dengan ide proyek nyata untuk berbagai teknologi
          </p>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field !pl-10"
              />
            </div>
            <div className="flex gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    category === c.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-dark-200 rounded w-20 mb-3"></div>
                <div className="h-5 bg-dark-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-dark-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-dark-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <FiFilter className="mx-auto text-dark-300 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-dark-700 mb-2">No projects found</h3>
            <p className="text-dark-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                isCompleted={completedIds.has(project._id)}
                onToggleComplete={() => handleToggleComplete(project._id)}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
