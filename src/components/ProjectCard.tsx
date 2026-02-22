import Link from 'next/link';
import { FiClock, FiCheck, FiUsers } from 'react-icons/fi';

interface ProjectCardProps {
  project: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    tags: string[];
    technologies: string[];
    estimatedHours: number;
    estimatedTimeUnit?: string;
    completedCount?: number;
  };
  isCompleted?: boolean;
  onToggleComplete?: () => void;
}

export default function ProjectCard({ project, isCompleted, onToggleComplete }: ProjectCardProps) {
  return (
    <div className={`card p-6 flex flex-col h-full transition-all ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="badge bg-dark-100 text-dark-600">{project.category}</span>
      </div>

      <h3 className="text-lg font-semibold text-dark-900 mb-2">{project.title}</h3>
      <p className="text-sm text-dark-500 mb-4 flex-grow line-clamp-3">{project.description}</p>

      {/* Technologies */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.technologies?.slice(0, 4).map((tech) => (
          <span key={tech} className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-md">
            {tech}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-dark-100">
        <div className="flex items-center gap-3 text-xs text-dark-500">
          {project.estimatedHours > 0 && (
            <span className="flex items-center gap-1">
              <FiClock size={12} /> {project.estimatedHours}{project.estimatedTimeUnit === 'minutes' ? 'm' : 'h'}
            </span>
          )}
          {project.completedCount !== undefined && (
            <span className="flex items-center gap-1">
              <FiUsers size={12} /> {project.completedCount} completed
            </span>
          )}
        </div>

        {onToggleComplete && (
          <button
            onClick={(e) => { e.preventDefault(); onToggleComplete(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isCompleted
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
            }`}
          >
            <FiCheck size={12} /> {isCompleted ? 'Completed' : 'Mark Done'}
          </button>
        )}
      </div>
    </div>
  );
}
