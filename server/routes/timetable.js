const express = require('express');
const router = express.Router();
const TimeTable = require('../models/TimeTable');
const { auth } = require('../middleware/auth'); // ✅ FIXED: Added curly braces

// @route   GET /api/timetable
router.get('/', auth, async (req, res) => {
  try {
    // Uses req.user._id from the middleware
    const schedule = await TimeTable.find({ user: req.user._id }).sort({ startTime: 1 });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/timetable
router.post('/', auth, async (req, res) => {
  try {
    const newSlot = new TimeTable({ 
      ...req.body, 
      user: req.user._id 
    });
    const slot = await newSlot.save();
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: 'Error saving slot' });
  }
});

// @route   DELETE /api/timetable/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await TimeTable.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Slot removed' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;