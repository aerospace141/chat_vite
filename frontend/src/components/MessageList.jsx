import React from 'react';

const MessageList = ({ messages, currentUserMobile }) => {
  if (!Array.isArray(messages)) {
    console.error("Invalid messages:", messages);
    return <div className="error-message">Something went wrong loading messages.</div>;
  }

  // ✅ Define formatTime BEFORE using it
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach(message => {
      const date = message.createdAt
        ? new Date(message.createdAt).toDateString()
        : 'Unknown';
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (messages.length === 0) {
    return <div className="no-messages">No messages yet. Send a message to start the conversation!</div>;
  }

  return (
    <div className="message-list">
      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date} className="message-date-group">
          <div className="date-divider">
            <span>{date}</span>
          </div>

          {dateMessages.map((message) => {
            const isCurrentUser = message.sender === currentUserMobile;

            return (
              <div
                key={message._id}
                className={`message ${isCurrentUser ? 'message-sent' : 'message-received'}`}
              >
                <div className="message-content">
                  <p>{message.text}</p>
                  {message.createdAt && (
                    <span className="message-time">{formatTime(message.createdAt)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
