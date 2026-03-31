const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// 1. Load Environment Variables
dotenv.config();

// Debugging: This will tell us if your .env is actually being read
console.log("🛠️  Checking MONGO_URI:", process.env.MONGO_URI ? "Found ✅" : "NOT FOUND ❌");

const app = express();

// 2. Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://student-hub.vercel.app',
    'https://student-hub-ten-kappa.vercel.app' 
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Routes Registration
// Ensure these files exist in your /routes folder and use module.exports
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
app.get('/api/health', (req, res) => res.json({ status: 'ok', worker: 'active' }));

// 4. Server Start Logic
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Critical Startup Error:", err.message);
    // On local, don't exit so nodemon can watch for fixes
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

startServer();

// Export for Vercel (This is required for vercel.json to hook in)
module.exports = app;