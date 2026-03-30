const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    default: 'General',
    trim: true,
  },
}, { timestamps: true });

// Index for fast user queries sorted by latest
doubtSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Doubt', doubtSchema);
