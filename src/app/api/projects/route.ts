import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MOCK_PROJECTS = [
  {
    _id: '1',
    title: 'Build a Todo App',
    slug: 'build-todo-app',
    description: 'Create a full-featured todo application with CRUD operations, filtering, and local storage',
    category: 'frontend',
    tags: ['javascript', 'html', 'css'],
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'LocalStorage'],
    requirements: [
      'Add, edit, and delete todos',
      'Mark todos as complete',
      'Filter by status (all, active, completed)',
      'Persist data in localStorage',
      'Responsive design',
    ],
    learningOutcomes: [
      'DOM manipulation',
      'Event handling',
      'LocalStorage API',
      'Array methods',
      'Responsive CSS',
    ],
    completedBy: [],
  },
  {
    _id: '2',
    title: 'REST API with Node.js',
    slug: 'rest-api-nodejs',
    description: 'Build a RESTful API with authentication, CRUD operations, and database integration',
    category: 'backend',
    tags: ['nodejs', 'express', 'mongodb'],
    technologies: ['Node.js', 'Express', 'MongoDB', 'JWT'],
    requirements: [
      'User authentication with JWT',
      'CRUD endpoints for resources',
      'MongoDB integration',
      'Error handling middleware',
      'Input validation',
      'API documentation',
    ],
    learningOutcomes: [
      'RESTful API design',
      'Authentication & authorization',
      'Database modeling',
      'Middleware patterns',
      'Error handling',
    ],
    completedBy: [],
  },
  {
    _id: '3',
    title: 'E-commerce Dashboard',
    slug: 'ecommerce-dashboard',
    description: 'Create an admin dashboard for e-commerce with charts, analytics, and product management',
    category: 'frontend',
    tags: ['react', 'typescript', 'charts'],
    technologies: ['React', 'TypeScript', 'Chart.js', 'Tailwind CSS'],
    requirements: [
      'Product CRUD operations',
      'Sales analytics with charts',
      'Order management',
      'User management',
      'Responsive design',
      'Dark mode support',
    ],
    learningOutcomes: [
      'React state management',
      'Data visualization',
      'TypeScript integration',
      'Component architecture',
      'API integration',
    ],
    completedBy: [],
  },
  {
    _id: '4',
    title: 'Real-time Chat App',
    slug: 'realtime-chat-app',
    description: 'Build a real-time chat application with WebSockets, rooms, and user presence',
    category: 'fullstack',
    tags: ['websocket', 'realtime', 'fullstack'],
    technologies: ['Socket.io', 'React', 'Node.js', 'MongoDB'],
    requirements: [
      'Real-time messaging',
      'Multiple chat rooms',
      'User authentication',
      'Online status',
      'Message history',
      'File sharing',
    ],
    learningOutcomes: [
      'WebSocket communication',
      'Real-time data sync',
      'Event-driven architecture',
      'Full-stack integration',
    ],
    completedBy: [],
  },
  {
    _id: '5',
    title: 'Portfolio Website',
    slug: 'portfolio-website',
    description: 'Design and build a professional portfolio website to showcase your projects',
    category: 'frontend',
    tags: ['html', 'css', 'portfolio'],
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
    requirements: [
      'Hero section with introduction',
      'Projects showcase',
      'About section',
      'Contact form',
      'Smooth scrolling',
      'Mobile responsive',
    ],
    learningOutcomes: [
      'Layout design',
      'CSS animations',
      'Form handling',
      'Responsive design',
    ],
    completedBy: [],
  },
  {
    _id: '6',
    title: 'Blog with CMS',
    slug: 'blog-cms',
    description: 'Create a blog platform with content management system and markdown support',
    category: 'fullstack',
    tags: ['nextjs', 'blog', 'cms'],
    technologies: ['Next.js', 'MDX', 'Tailwind CSS', 'MongoDB'],
    requirements: [
      'Markdown blog posts',
      'Category & tags',
      'Search functionality',
      'Comments system',
      'Admin panel',
      'SEO optimization',
    ],
    learningOutcomes: [
      'Next.js features',
      'Markdown processing',
      'SEO best practices',
      'Static generation',
    ],
    completedBy: [],
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  let filtered = [...MOCK_PROJECTS];

  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.tags.some(t => t.includes(searchLower))
    );
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    _mock: true,
  });
}