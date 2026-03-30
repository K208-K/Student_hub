const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exams: [{
    subject: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: String, default: '' },
    notes: { type: String, default: '' },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
