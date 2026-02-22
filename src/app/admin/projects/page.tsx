'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave
} from 'react-icons/fi';

const CATEGORIES = [
  'frontend', 'backend', 'devops', 'mobile', 'ai-ml',
  'blockchain', 'cybersecurity', 'database', 'cloud',
  'game-dev', 'data-science', 'design', 'other'
];

export default function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'frontend',
    tags: [] as string[],
    technologies: [] as string[],
    requirements: [] as string[],
    learningOutcomes: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [outcomeInput, setOutcomeInput] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [search]);

  const fetchProjects = async () => {
    try {
      const { data } = await adminAPI.getProjects({ search, limit: 100 });
      const projectsList = data.data?.projects || data.data || data.projects || [];
      setProjects(Array.isArray(projectsList) ? projectsList : []);
    } catch {
      console.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '', description: '', category: 'frontend',
      tags: [], technologies: [], requirements: [], learningOutcomes: [],
    });
    setShowModal(true);
  };

  const openEdit = (project: any) => {
    setEditing(project);
    setForm({
      title: project.title,
      description: project.description,
      category: project.category,
      tags: project.tags || [],
      technologies: project.technologies || [],
      requirements: project.requirements || [],
      learningOutcomes: project.learningOutcomes || [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    try {
      if (editing) {
        await adminAPI.updateProject(editing._id, form);
        toast.success('Project updated');
      } else {
        await adminAPI.createProject(form);
        toast.success('Project created');
      }
      setShowModal(false);
      fetchProjects();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      await adminAPI.deleteProject(id);
      toast.success('Deleted');
      fetchProjects();
    } catch {
      toast.error('Failed');
    }
  };

  const addToArray = (
    field: 'tags' | 'technologies' | 'requirements' | 'learningOutcomes',
    value: string,
    setter: (v: string) => void
  ) => {
    if (value.trim()) {
      setForm(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
      setter('');
    }
  };

  const removeFromArray = (
    field: 'tags' | 'technologies' | 'requirements' | 'learningOutcomes',
    idx: number
  ) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 mb-1">Project Management</h1>
          <p className="text-dark-500">Create and manage project ideas</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> New Project
        </button>
      </div>

      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field !pl-10"
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-50 border-b border-dark-200">
            <tr>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Project</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Category</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Technologies</th>
              <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Completed</th>
              <th className="text-right text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-dark-400">Loading...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-dark-400">No projects found</td></tr>
            ) : (
              projects.map((p) => (
                <tr key={p._id} className="hover:bg-dark-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-dark-900">{p.title}</p>
                    <p className="text-xs text-dark-500 line-clamp-1">{p.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge bg-dark-100 text-dark-600">{p.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(p.technologies || []).slice(0, 3).map((t: string, i: number) => (
                        <span key={i} className="badge bg-primary-50 text-primary-700 !text-[10px]">{t}</span>
                      ))}
                      {(p.technologies?.length || 0) > 3 && (
                        <span className="text-xs text-dark-400">+{p.technologies.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-600">{p.completedBy?.length || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="p-2 hover:bg-primary-50 rounded-lg text-primary-600"><FiEdit2 size={16} /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><FiTrash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-dark-100 rounded-lg"><FiX size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-dark-700 mb-1 block">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-700 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-field !h-24 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-700 mb-1 block">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-dark-700 mb-1 block">Tags</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {form.tags.map((t, i) => (
                    <span key={i} className="badge bg-dark-100 text-dark-700 flex items-center gap-1">
                      {t} <button onClick={() => removeFromArray('tags', i)}><FiX size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)} className="input-field !text-sm flex-1"
                    placeholder="Add tag" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToArray('tags', tagInput, setTagInput); } }} />
                  <button onClick={() => addToArray('tags', tagInput, setTagInput)} className="btn-primary !py-2 !px-3"><FiPlus size={14} /></button>
                </div>
              </div>

              {/* Technologies */}
              <div>
                <label className="text-sm font-medium text-dark-700 mb-1 block">Technologies</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {form.technologies.map((t, i) => (
                    <span key={i} className="badge bg-primary-50 text-primary-700 flex items-center gap-1">
                      {t} <button onClick={() => removeFromArray('technologies', i)}><FiX size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input value={techInput} onChange={e => setTechInput(e.target.value)} className="input-field !text-sm flex-1"
                    placeholder="e.g. React, Node.js" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToArray('technologies', techInput, setTechInput); } }} />
                  <button onClick={() => addToArray('technologies', techInput, setTechInput)} className="btn-primary !py-2 !px-3"><FiPlus size={14} /></button>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="text-sm font-medium text-dark-700 mb-1 block">Requirements</label>
                <div className="space-y-1 mb-2">
                  {form.requirements.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-dark-50 px-3 py-1.5 rounded">
                      <span className="flex-1">{r}</span>
                      <button onClick={() => removeFromArray('requirements', i)} className="text-red-400"><FiX size={12} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input value={reqInput} onChange={e => setReqInput(e.target.value)} className="input-field !text-sm flex-1"
                    placeholder="Add requirement" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToArray('requirements', reqInput, setReqInput); } }} />
                  <button onClick={() => addToArray('requirements', reqInput, setReqInput)} className="btn-primary !py-2 !px-3"><FiPlus size={14} /></button>
                </div>
              </div>

              {/* Learning Outcomes */}
              <div>
                <label className="text-sm font-medium text-dark-700 mb-1 block">Learning Outcomes</label>
                <div className="space-y-1 mb-2">
                  {form.learningOutcomes.map((o, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-dark-50 px-3 py-1.5 rounded">
                      <span className="flex-1">{o}</span>
                      <button onClick={() => removeFromArray('learningOutcomes', i)} className="text-red-400"><FiX size={12} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input value={outcomeInput} onChange={e => setOutcomeInput(e.target.value)} className="input-field !text-sm flex-1"
                    placeholder="Add outcome" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToArray('learningOutcomes', outcomeInput, setOutcomeInput); } }} />
                  <button onClick={() => addToArray('learningOutcomes', outcomeInput, setOutcomeInput)} className="btn-primary !py-2 !px-3"><FiPlus size={14} /></button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-dark-200 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2"><FiSave size={14} /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
