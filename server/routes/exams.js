const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { auth } = require('../middleware/auth'); // Adjust if your auth import is different!

// Get all exams
router.get('/', auth, async (req, res) => {
  try {
    const exams = await Exam.find({ user: req.user._id }).sort({ date: 1 });
    res.json({ exams });
  } catch (err) { res.status(500).send('Server Error'); }
});

// Add an exam
router.post('/', auth, async (req, res) => {
  try {
    const newExam = new Exam({ ...req.body, user: req.user._id });
    await newExam.save();
    res.json({ exam: newExam });
  } catch (err) { res.status(500).send('Server Error'); }
});

// Delete an exam
router.delete('/:id', auth, async (req, res) => {
  try {
    await Exam.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ msg: 'Exam deleted' });
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;