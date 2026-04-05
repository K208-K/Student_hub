const express = require('express');
const router = express.Router();
const Homework = require('../models/Homework');
const { auth } = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

const limiter = rateLimiter({ windowMs: 60 * 1000, maxRequests: 60 });

// GET all homework for the logged-in user
router.get('/', auth, limiter, async (req, res) => {
  try {
    const homework = await Homework.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ homework });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new homework entry
router.post('/', auth, limiter, async (req, res) => {
  try {
    const { title, subject, description, dueDate, priority } = req.body;
    if (!title || !subject) {
      return res.status(400).json({ message: 'Title and subject are required.' });
    }
    const homework = await Homework.create({
      user: req.user._id,
      title,
      subject,
      description: description || '',
      dueDate: dueDate || '',
      priority: priority || 'medium',
      completed: false
    });
    res.status(201).json(homework);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH toggle completed / update a homework entry
router.patch('/:id', auth, limiter, async (req, res) => {
  try {
    const homework = await Homework.findOne({ _id: req.params.id, user: req.user._id });
    if (!homework) return res.status(404).json({ message: 'Not found' });

    const { title, subject, description, dueDate, priority, completed } = req.body;
    if (title !== undefined) homework.title = title;
    if (subject !== undefined) homework.subject = subject;
    if (description !== undefined) homework.description = description;
    if (dueDate !== undefined) homework.dueDate = dueDate;
    if (priority !== undefined) homework.priority = priority;
    if (completed !== undefined) homework.completed = completed;

    await homework.save();
    res.json(homework);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a homework entry
router.delete('/:id', auth, limiter, async (req, res) => {
  try {
    const homework = await Homework.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!homework) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
