const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  college: { type: String, default: '' },
  department: { type: String, default: '' },
  semester: { type: Number, default: 1 },
  rollNo: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
}, { timestamps: true });


// ✅ FIXED: Async middleware (NO next)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});


// ✅ Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', userSchema);