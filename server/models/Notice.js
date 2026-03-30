const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['general', 'exam', 'event', 'urgent'], default: 'general' },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false } // Note: In a real app with many users, 'read' status usually belongs in a separate User-Notice mapping table, but this works for a personal dashboard!
}, { timestamps: true });

module.exports = mongoose.model('Notice', NoticeSchema);