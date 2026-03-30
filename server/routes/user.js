const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// ✅ GET PROFILE
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE PROFILE (FULL REPLACE LIKE ATTENDANCE)
router.put('/', auth, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { ...req.body },
      { new: true }
    ).select('-password');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;