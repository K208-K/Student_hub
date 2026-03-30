const express = require('express');
const router = express.Router();
const Planner = require('../models/Planner');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    let record = await Planner.findOne({ user: req.user._id });
    if (!record) return res.json({ tasks: [] });
    res.json(record);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/', auth, async (req, res) => {
  try {
    let record = await Planner.findOne({ user: req.user._id });
    if (record) {
      record.tasks = req.body.tasks;
      await record.save();
      return res.json(record);
    }
    record = new Planner({ user: req.user._id, tasks: req.body.tasks });
    await record.save();
    res.json(record);
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;