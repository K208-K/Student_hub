const mongoose = require('mongoose');

const PlannerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // We store tasks as an array inside the user's planner document
  tasks: [{
    id: { type: String }, // Storing frontend Date.now() ID
    title: { type: String, required: true },
    subject: { type: String, default: 'General' },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    completed: { type: Boolean, default: false },
    dueDate: { type: String, default: '' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Planner', PlannerSchema);