const jwt = require('jsonwebtoken');
const User = require('../models/User');


// ✅ Generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};


// ✅ Remove password before sending response
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  college: user.college,
  department: user.department,
  semester: user.semester,
  rollNo: user.rollNo,
  role: user.role,
  avatar: user.avatar,
  createdAt: user.createdAt,
});


// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password, college, department, semester, rollNo } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      college: college?.trim() || '',
      department: department?.trim() || '',
      semester: semester || 1,
      rollNo: rollNo?.trim() || '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: sanitizeUser(user),
    });

  } catch (err) {
    console.error('Register error:', err);

    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    res.status(500).json({ message: 'Server error during registration' });
  }
};


// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};


// ================= GET PROFILE =================
exports.getMe = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};