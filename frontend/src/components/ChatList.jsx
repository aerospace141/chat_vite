import React from 'react';

const ChatList = ({ chats, currentUserMobile, onChatClick }) => {
  // Function to get the other user from a chat
  const getOtherUser = (chat) => {
    const otherParticipant = chat.participants.find(p => p.mobile !== currentUserMobile);
    return otherParticipant || { mobile: 'Unknown User' };
  };

  // Function to get the last message preview
  const getLastMessagePreview = (chat) => {
    if (!chat.lastMessage) {
      return 'No messages yet';
    }
    
    const preview = chat.lastMessage.text;
    return preview.length > 30 ? `${preview.substring(0, 30)}...` : preview;
  };

  // Function to format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (chats.length === 0) {
    return <div className="no-chats">No chats yet. Start a new conversation!</div>;
  }

  return (
    <div className="chat-list">
      {chats.map((chat) => {
        const otherUser = getOtherUser(chat);
        
        return (
          <div 
            key={chat._id} 
            className="chat-item"
            onClick={() => onChatClick(chat._id, otherUser.mobile)}
          >
            <div className="chat-item-avatar">
              {otherUser.mobile.substring(0, 2)}
            </div>
            <div className="chat-item-details">
              <div className="chat-item-header">
                <h4>{otherUser.mobile}</h4>
                <span className="chat-item-time">
                  {formatTime(chat.lastMessage?.createdAt)}
                </span>
              </div>
              <p className="chat-item-message">{getLastMessagePreview(chat)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;