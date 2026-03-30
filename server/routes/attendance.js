const express = require('express');
const Attendance = require('../models/Attendance');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get attendance
router.get('/', auth, async (req, res) => {
  try {
    let record = await Attendance.findOne({ userId: req.user._id });
    if (!record) record = await Attendance.create({ userId: req.user._id, subjects: [] });
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Save attendance
router.put('/', auth, async (req, res) => {
  try {
    const record = await Attendance.findOneAndUpdate(
      { userId: req.user._id },
      { subjects: req.body.subjects },
      { new: true, upsert: true }
    );
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
