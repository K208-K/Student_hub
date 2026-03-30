const User = require('../models/User');

// PUT /api/user/profile — Update profile fields permanently in MongoDB
exports.updateProfile = async (req, res) => {
  try {
    const { name, college, department, semester, rollNo } = req.body;

    const allowedUpdates = {};
    if (name !== undefined) allowedUpdates.name = name.trim();
    if (college !== undefined) allowedUpdates.college = college.trim();
    if (department !== undefined) allowedUpdates.department = department.trim();
    if (semester !== undefined) allowedUpdates.semester = Number(semester);
    if (rollNo !== undefined) allowedUpdates.rollNo = rollNo.trim();

    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// GET /api/user/profile — Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/user/profile — Delete account
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
