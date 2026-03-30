const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { auth } = require('../middleware/auth');

// Get all notices
router.get('/', auth, async (req, res) => {
  try {
    const notices = await Notice.find().sort({ date: -1 }); // Sort newest first
    res.json({ notices });
  } catch (err) { res.status(500).send('Server Error'); }
});

// Post new notice
router.post('/', auth, async (req, res) => {
  try {
    const newNotice = new Notice(req.body);
    await newNotice.save();
    res.json({ notice: newNotice });
  } catch (err) { res.status(500).send('Server Error'); }
});

// Mark read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(notice);
  } catch (err) { res.status(500).send('Server Error'); }
});

// Delete notice
router.delete('/:id', auth, async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Notice removed' });
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;