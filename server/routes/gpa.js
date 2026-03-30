const express = require('express');
const GPA = require('../models/GPA');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let record = await GPA.findOne({ userId: req.user._id });
    if (!record) record = await GPA.create({ userId: req.user._id, semesters: [] });
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/', auth, async (req, res) => {
  try {
    const record = await GPA.findOneAndUpdate(
      { userId: req.user._id },
      { semesters: req.body.semesters, cgpa: req.body.cgpa, targetCgpa: req.body.targetCgpa },
      { new: true, upsert: true }
    );
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
