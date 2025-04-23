import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { messageService, userService } from '../services/api';
import { getSocket, initSocket } from '../services/socket';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';

const Chat = () => {
  const { mobile } = useParams(); // The mobile number of the other user
  const { currentUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socket = useRef(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);


  useEffect(() => {
    // Initialize socket
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    socket.current = initSocket(token);

    // Fetch other user details
    const getUserDetails = async () => {
      try {
        const response = await userService.findByMobile(mobile);
        setOtherUser(response.data);
      } catch (error) {
        setError('Failed to fetch user details');
      }
    };

    // Fetch previous messages
    const getMessages = async () => {
      try {
        const response = await messageService.getMessages(mobile);
        const data = response.data;
    
        if (!Array.isArray(data.messages)) {
          console.error("Expected messages array, got:", data);
          setError("Invalid message format from server");
        } else {
          setMessages(data.messages); // ✅ fix here
        }
    
        setLoading(false);
      } catch (error) {
        setError('Failed to load messages');
        setLoading(false);
      }
    };
    

    getUserDetails();
    getMessages();

    // Socket event listeners
    socket.current.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.current.on('receive_message', (message) => {
      if (
        (message.sender === mobile && message.receiver === currentUser.mobile) ||
        (message.sender === currentUser.mobile && message.receiver === mobile)
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      // Clean up socket event listeners
      if (socket.current) {
        socket.current.off('receive_message');
      }
      
    };
  }, [mobile, currentUser, navigate]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text) => {
    try {
      await messageService.sendMessage(mobile, text);
      
      // The message will be added to the state through the socket event
      // to ensure consistency with the server timestamp
      if (socket.current) {
        socket.current.emit('send_message', messageService.data);
      }
      

      // CONSISTENT UPDATE
    } catch (error) {
      setError('Failed to send message');
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <button className="back-btn" onClick={handleBackClick}>Back</button>
        <div className="chat-user-info">
          <h3>{otherUser ? otherUser.mobile : mobile}</h3>
        </div>
      </header>

      <div className="chat-content">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <MessageList 
            messages={messages} 
            currentUserMobile={currentUser.mobile} 
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Chat;