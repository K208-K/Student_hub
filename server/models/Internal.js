const mongoose = require('mongoose');

const InternalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semesters: [{
    semesterNo: Number,
    subjects: [{
      code: String,
      name: String,
      scaledTarget: { type: Number, default: 40 },
      components: [{
        name: String,
        max: Number,
        obtained: Number
      }]
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Internal', InternalSchema);