const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// --- Middleware ---
// ✅ Update 'origin' with your actual Vercel URL after deploying frontend
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://student-hub-vercel.app', 'https://student-hub.vercel.app'] 
    : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
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

// Health check for Render
app.get('/api/health', (req, res) => res.json({ status: 'ok', server: 'Production' }));

// --- Connect DB & Start ---
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    // '0.0.0.0' is required for Render to bind correctly
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB Connection Error:', err.message);
    process.exit(1);
  });