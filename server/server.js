const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// --- Middleware ---
app.use(cors());
// ✅ FIXED: High limit for profile picture Base64 strings
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes Registration ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/gpa', require('./routes/gpa'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/internal', require('./routes/internal'));
app.use('/api/planner', require('./routes/planner'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/placement', require('./routes/placement'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error('⚠️ Unhandled error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

// --- Connect DB & Start ---
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 OS Server running on port ${PORT}`));
});