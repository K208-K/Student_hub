const mongoose = require('mongoose');

const HomeworkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: String, default: '' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Homework', HomeworkSchema);
