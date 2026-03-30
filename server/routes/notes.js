const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { auth } = require("../middleware/auth");
const Note = require("../models/Note");

// 📁 STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

// 🚫 VALIDATION
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF allowed"));
    }
    cb(null, true);
  }
});

// ✅ GET NOTES
router.get("/", auth, async (req, res) => {
  const notes = await Note.find({ userId: req.user._id });
  res.json({ notes });
});

// ✅ UPLOAD NOTE
router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    const note = await Note.create({
      userId: req.user._id,
      title: req.body.title,
      subject: req.body.subject,
      type: req.body.type,
      semester: req.body.semester,
      description: req.body.description,
      fileName: req.file.filename,
      filePath: req.file.path
    });

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ DELETE NOTE
router.delete("/:id", auth, async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) return res.status(404).json({ message: "Not found" });

  // delete file
  if (fs.existsSync(note.filePath)) {
    fs.unlinkSync(note.filePath);
  }

  await note.deleteOne();

  res.json({ success: true });
});

module.exports = router;