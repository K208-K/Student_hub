const mongoose = require('mongoose');

const subjectAttendanceSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  totalClasses: { type: Number, default: 0 },
  attendedClasses: { type: Number, default: 0 },
});

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjects: [subjectAttendanceSchema],
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
