const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  profilePicture: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('User', UserSchema);