const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

let io; // 👈 make a reference at the top
exports.injectIO = (serverIO) => { io = serverIO };

// Get messages between two users
exports.getMessages = async (req, res) => {
  try {
    const userMobile = req.user.mobile;
    const { mobile: otherMobile } = req.params;
    
    // Find or create chat between these two users
    let chat = await Chat.findOne({
      participants: { $all: [userMobile, otherMobile] }
    });
    
    if (!chat) {
      // Check if the other user exists
      const otherUser = await User.findOne({ mobile: otherMobile });
      
      if (!otherUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Create a new chat
      chat = new Chat({
        participants: [userMobile, otherMobile]
      });
      
      await chat.save();
      
      // Return empty messages array for new chat
      return res.json({ messages: [], chatId: chat._id });
    }
    
    // Get messages for this chat
    const messages = await Message.find({ chatId: chat._id })
      .sort({ timestamp: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { chatId: chat._id, receiver: userMobile, read: false },
      { $set: { read: true } }
    );
    
    res.json({ messages, chatId: chat._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, text, chatId } = req.body;
    const sender = req.user.mobile;
    
    if (!receiver || !text) {
      return res.status(400).json({ message: 'Receiver and text are required' });
    }
    
    // Find or create chat
    let chat;
    
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
    } else {
      chat = await Chat.findOne({
        participants: { $all: [sender, receiver] }
      });
      
      if (!chat) {
        // Check if the receiver exists
        const receiverUser = await User.findOne({ mobile: receiver });
        
        if (!receiverUser) {
          return res.status(404).json({ message: 'Receiver not found' });
        }
        
        // Create a new chat
        chat = new Chat({
          participants: [sender, receiver]
        });
      }
    }
    
    // Create a new message
    const message = new Message({
      chatId: chat._id,
      sender,
      receiver,
      text
    });
    
    await message.save();

    
    // Update the chat's lastMessage and updatedAt
    chat.lastMessage = message._id;
    chat.updatedAt = Date.now();
    await chat.save();

    // Emit message via socket
    if (io) {
      io.emit('receive_message', {
        _id: message._id,
        chatId: message.chatId,
        sender: message.sender,
        receiver: message.receiver,
        text: message.text,
        createdAt: message.createdAt
      });
    }

    
    res.status(201).json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};