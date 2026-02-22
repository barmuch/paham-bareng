import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const teamRoadmapSchema = new mongoose.Schema({
  roadmap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    required: true,
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  deadline: {
    type: Date,
  },
  isRequired: {
    type: Boolean,
    default: true,
  },
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 1000,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [teamMemberSchema],
  roadmaps: [teamRoadmapSchema],
  inviteCode: {
    type: String,
    unique: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  skillTracking: {
    enabled: { type: Boolean, default: true },
    skills: [{
      name: { type: String },
      category: { type: String },
    }],
  },
  maxMembers: {
    type: Number,
    default: 50,
  },
}, {
  timestamps: true,
});

// Generate invite code
teamSchema.pre('save', function (next) {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase() +
      Math.random().toString(36).substring(2, 5).toUpperCase();
  }
  next();
});

teamSchema.index({ owner: 1 });
teamSchema.index({ inviteCode: 1 });
teamSchema.index({ 'members.user': 1 });

export default mongoose.models.Team || mongoose.model('Team', teamSchema);
