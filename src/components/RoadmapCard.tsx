import Link from 'next/link';
import { FiArrowRight, FiEye, FiHeart, FiClock } from 'react-icons/fi';

interface RoadmapCardProps {
  roadmap: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    icon: string;
    category: string;
    estimatedHours: number;
    estimatedTimeUnit?: string;
    tags: string[];
    views: number;
    likes: number;
    isFeatured: boolean;
    isOfficial: boolean;
  };
}

export default function RoadmapCard({ roadmap }: RoadmapCardProps) {
  return (
    <Link href={`/roadmaps/${roadmap.slug}`} className="block group">
      <div className="card p-6 h-full flex flex-col group-hover:border-primary-300 group-hover:-translate-y-1">
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl">{roadmap.icon}</span>
          <div className="flex items-center gap-2">
            {roadmap.isOfficial && (
              <span className="badge bg-primary-100 text-primary-700">Official</span>
            )}
            {roadmap.isFeatured && (
              <span className="badge bg-yellow-100 text-yellow-700">Featured</span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-dark-900 mb-2 group-hover:text-primary-600 transition-colors">
          {roadmap.title}
        </h3>

        <p className="text-sm text-dark-500 mb-4 flex-grow line-clamp-2">
          {roadmap.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="badge bg-dark-100 text-dark-600">
            {roadmap.category.replace('-', ' ')}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-dark-100 text-xs text-dark-500">
          <div className="flex items-center gap-3">
            {roadmap.estimatedHours > 0 && (
              <span className="flex items-center gap-1">
                <FiClock size={12} /> {roadmap.estimatedHours}{roadmap.estimatedTimeUnit === 'minutes' ? 'm' : 'h'}
              </span>
            )}
            <span className="flex items-center gap-1">
              <FiEye size={12} /> {roadmap.views}
            </span>
            <span className="flex items-center gap-1">
              <FiHeart size={12} /> {roadmap.likes}
            </span>
          </div>
          <span className="flex items-center gap-1 text-primary-600 font-medium group-hover:gap-2 transition-all">
            View <FiArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
