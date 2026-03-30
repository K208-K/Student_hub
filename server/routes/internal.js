const express = require('express');
const router = express.Router();
const Internal = require('../models/Internal');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    let record = await Internal.findOne({ user: req.user._id });
    if (!record) return res.json({ semesters: [] });
    res.json(record);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/', auth, async (req, res) => {
  try {
    let record = await Internal.findOne({ user: req.user._id });
    if (record) {
      record.semesters = req.body.semesters;
      await record.save();
      return res.json(record);
    }
    record = new Internal({ user: req.user._id, semesters: req.body.semesters });
    await record.save();
    res.json(record);
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;