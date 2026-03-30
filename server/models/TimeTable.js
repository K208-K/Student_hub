const mongoose = require('mongoose');

const TimeTableSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true },
  subject: { type: String },
  type: { type: String, enum: ['Theory', 'Practical', 'Lunch'], default: 'Theory' },
  room: { type: String },
  faculty: { type: String },
  startTime: { type: String, required: true }, // Format "HH:mm"
  endTime: { type: String, required: true }    // Format "HH:mm"
}, { timestamps: true });

module.exports = mongoose.model('TimeTable', TimeTableSchema);