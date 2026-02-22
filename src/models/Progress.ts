import mongoose from 'mongoose';

const nodeProgressSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'skipped'],
    default: 'not-started',
  },
  completedAt: {
    type: Date,
  },
  notes: {
    type: String,
    maxlength: 1000,
    default: '',
  },
  timeSpentMinutes: {
    type: Number,
    default: 0,
  },
});

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  roadmap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
  },
  nodeProgress: [nodeProgressSchema],
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  totalTimeSpentMinutes: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Calculate percentage before saving
progressSchema.pre('save', function (next) {
  if (this.nodeProgress && this.nodeProgress.length > 0) {
    const completed = this.nodeProgress.filter((n: any) => n.status === 'completed').length;
    const total = this.nodeProgress.filter((n: any) => n.status !== 'skipped').length;
    this.percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    this.totalTimeSpentMinutes = this.nodeProgress.reduce((sum: number, n: any) => sum + (n.timeSpentMinutes || 0), 0);
    this.lastActivityAt = new Date();
    if (this.percentage === 100 && !this.completedAt) {
      this.completedAt = new Date();
    }
  }
  next();
});

progressSchema.index({ user: 1, roadmap: 1 }, { unique: true });
progressSchema.index({ user: 1, team: 1 });
progressSchema.index({ roadmap: 1 });

export default mongoose.models.Progress || mongoose.model('Progress', progressSchema);
