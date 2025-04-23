const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

// Map to store connected users (mobile number -> socket id)
const connectedUsers = new Map();

module.exports = (io) => {
  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    const userMobile = socket.user.mobile;
    
    console.log(`User connected: ${userMobile}`);
    
    // Add user to connected users map
    connectedUsers.set(userMobile, socket.id);
    
    // Update user's last seen
    User.findOneAndUpdate({ mobile: userMobile }, { lastSeen: Date.now() })
      .catch(err => console.error('Error updating last seen:', err));
    
    // Join a room for this user
    socket.join(userMobile);
    
    // Listen for new messages
    socket.on('send_message', async (data) => {
      try {
        const { receiver, text, chatId } = data;
        const sender = userMobile;
        
        // Find or create chat
        let chat;
        
        if (chatId) {
          chat = await Chat.findById(chatId);
          if (!chat) {
            throw new Error('Chat not found');
          }
        } else {
          chat = await Chat.findOne({
            participants: { $all: [sender, receiver] }
          });
          
          if (!chat) {
            // Check if the receiver exists
            const receiverUser = await User.findOne({ mobile: receiver });
            
            if (!receiverUser) {
              throw new Error('Receiver not found');
            }
            
            // Create a new chat
            chat = new Chat({
              participants: [sender, receiver]
            });
            
            await chat.save();
          }
        }
        
        // Create a new message
        const message = new Message({
          chatId: chat._id,
          sender,
          receiver,
          text,
          timestamp: Date.now()
        });
        
        await message.save();
        
        // Update the chat's lastMessage and updatedAt
        chat.lastMessage = message._id;
        chat.updatedAt = Date.now();
        await chat.save();
        
        // Emit the message to both sender and receiver
        io.to(receiver).emit('receive_message', {
          message,
          chat: { id: chat._id }
        });
        
        socket.emit('message_sent', {
          message,
          chat: { id: chat._id }
        });
        
        // Notify receiver about new message (if online and not in the same chat)
        if (connectedUsers.has(receiver)) {
          io.to(receiver).emit('new_message_notification', {
            sender,
            chatId: chat._id
          });
        }
      } catch (err) {
        console.error('Error sending message:', err);
        socket.emit('message_error', { error: err.message });
      }
    });
    
    // Typing indicator
    socket.on('typing', ({ chatId, receiver }) => {
      if (connectedUsers.has(receiver)) {
        io.to(receiver).emit('user_typing', { chatId, sender: userMobile });
      }
    });
    
    // Stopped typing indicator
    socket.on('stop_typing', ({ chatId, receiver }) => {
      if (connectedUsers.has(receiver)) {
        io.to(receiver).emit('user_stop_typing', { chatId, sender: userMobile });
      }
    });
    
    // Mark messages as read
    socket.on('mark_read', async ({ chatId, sender }) => {
      try {
        await Message.updateMany(
          { chatId, sender, receiver: userMobile, read: false },
          { $set: { read: true } }
        );
        
        // Notify the sender that messages were read
        if (connectedUsers.has(sender)) {
          io.to(sender).emit('messages_read', { chatId, reader: userMobile });
        }
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userMobile}`);
      
      // Remove user from connected users map
      connectedUsers.delete(userMobile);
      
      // Update user's last seen
      User.findOneAndUpdate({ mobile: userMobile }, { lastSeen: Date.now() })
        .catch(err => console.error('Error updating last seen:', err));
    });
  });
};