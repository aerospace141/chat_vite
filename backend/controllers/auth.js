const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
exports.signup = async (req, res) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }
    
    // Check if user already exists
    let user = await User.findOne({ mobile });
    
    if (user) {
      return res.status(401).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({ mobile });
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, mobile: user.mobile },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        mobile: user.mobile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }
    
    // Check if user exists
    const user = await User.findOne({ mobile });
    
    // if (!user) {
    //   return res.status(400).json({ message: 'User does not exist' });
    // }
    
    // In a real application, you would implement OTP verification here
    // For this demo, we'll skip that step and just issue a token
    
    // Update last seen
    user.lastSeen = Date.now();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, mobile: user.mobile },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        mobile: user.mobile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify token (for protected routes)
exports.verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        id: user._id,
        mobile: user.mobile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify OTP (Mock for now)
exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ message: 'Mobile number and OTP are required' });
    }

    // In production, you'd verify OTP from DB or Redis
    if (otp !== '1234') {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update last seen
    user.lastSeen = Date.now();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, mobile: user.mobile },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        mobile: user.mobile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
