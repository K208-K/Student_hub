const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  semesterNo: { type: Number, required: true },
  subjects: [{
    name: { type: String, required: true },
    credits: { type: Number, required: true },
    grade: { type: String, required: true },
    gradePoint: { type: Number, required: true },
  }],
  sgpa: { type: Number, default: 0 },
});

const gpaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semesters: [semesterSchema],
  cgpa: { type: Number, default: 0 },
  targetCgpa: { type: Number, default: 8.0 },
}, { timestamps: true });

module.exports = mongoose.model('GPA', gpaSchema);
