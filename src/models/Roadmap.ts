import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['article', 'video', 'course', 'documentation', 'github', 'tool'], default: 'article' },
});

const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: ['topic', 'subtopic', 'resource', 'milestone', 'checkpoint'],
    default: 'topic',
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
  style: {
    backgroundColor: { type: String, default: '#ffffff' },
    borderColor: { type: String, default: '#3B82F6' },
    width: { type: Number, default: 180 },
    height: { type: Number, default: 50 },
  },
  resources: [resourceSchema],
  prerequisites: [{ type: String }],
  estimatedHours: { type: Number, default: 1 },
});

const edgeSchema = new mongoose.Schema({
  source: { type: String, required: true },
  target: { type: String, required: true },
  sourceAnchor: {
    type: String,
    enum: ['top', 'right', 'bottom', 'left'],
  },
  targetAnchor: {
    type: String,
    enum: ['top', 'right', 'bottom', 'left'],
  },
  style: {
    lineColor: { type: String, default: '#94a3b8' },
    lineStyle: { type: String, enum: ['solid', 'dashed', 'dotted'], default: 'solid' },
    strokeWidth: { type: Number, default: 1.5 },
    arrowStart: { type: Boolean, default: false },
    arrowEnd: { type: Boolean, default: false },
    connector: { type: String, enum: ['straight', 'curved', 'elbow'], default: 'straight' },
  },
});

const roadmapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: 100,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: 1000,
  },
  icon: {
    type: String,
    default: '🗺️',
  },
  category: {
    type: String,
    required: true,
    enum: [
      // Original (tech) categories
      'frontend', 'backend', 'devops', 'mobile', 'ai-ml',
      'blockchain', 'cybersecurity', 'database', 'cloud',
      'game-dev', 'data-science', 'design',
      // Islamic learning categories
      'aqidah', 'fiqh', 'sirah', 'quran', 'hadith', 'akhlaq', 'tazkiyah', 'arabic',
      // Fallback
      'other',
    ],
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
  }],
  nodes: [nodeSchema],
  edges: [edgeSchema],
  estimatedDuration: {
    type: Number, // in hours
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isOfficial: {
    type: Boolean,
    default: false,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  version: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

// Auto-generate slug from title
roadmapSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Calculate total estimated duration
  if (this.nodes && this.nodes.length > 0) {
    this.estimatedDuration = this.nodes.reduce((total, node) => {
      return total + (node.estimatedHours || 0);
    }, 0);
  }
  
  next();
});

export default mongoose.models.Roadmap || mongoose.model('Roadmap', roadmapSchema);