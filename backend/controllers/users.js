const User = require('../models/User');
const Chat = require('../models/Chat');

// Find a user by mobile number
exports.findByMobile = async (req, res) => {
  try {
    const { mobile } = req.params;
    
    const user = await User.findOne({ mobile }).select('-__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all chats for the current user
exports.getChats = async (req, res) => {
  try {
    const userMobile = req.user.mobile;
    
    const chats = await Chat.find({ participants: userMobile })
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    
    // Get the other participant's information for each chat
    const chatData = await Promise.all(chats.map(async (chat) => {
      const otherParticipantMobile = chat.participants.find(p => p !== userMobile);
      const otherParticipant = await User.findOne({ mobile: otherParticipantMobile }).select('-__v');
      
      return {
        id: chat._id,
        otherParticipant: {
          mobile: otherParticipant.mobile,
          profilePicture: otherParticipant.profilePicture
        },
        lastMessage: chat.lastMessage,
        updatedAt: chat.updatedAt
      };
    }));
    
    res.json({ chats: chatData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};