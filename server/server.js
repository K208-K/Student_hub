const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://student-hub.vercel.app",
        "https://student-hub-git-main-k208-ks-projects.vercel.app",
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // allow preview urls too
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server running successfully",
  });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/gpa", require("./routes/gpa"));
app.use("/api/timetable", require("./routes/timetable"));
app.use("/api/internal", require("./routes/internal"));
app.use("/api/planner", require("./routes/planner"));
app.use("/api/notes", require("./routes/notes"));
app.use("/api/notices", require("./routes/notices"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/exams", require("./routes/exams"));
app.use("/api/placement", require("./routes/placement"));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;