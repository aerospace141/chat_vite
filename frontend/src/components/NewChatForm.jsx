import React, { useState } from 'react';

const NewChatForm = ({ onSubmit, error }) => {
  const [mobile, setMobile] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mobile) {
      onSubmit(mobile);
      setMobile('');
      setIsFormOpen(false);
    }
  };

  const handleMobileChange = (e) => {
    setMobile(e.target.value);
  };

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
    setMobile('');
  };

  return (
    <div className="new-chat-section">
      {!isFormOpen ? (
        <button className="new-chat-btn" onClick={toggleForm}>
          New Chat
        </button>
      ) : (
        <div className="new-chat-form-container">
          <form onSubmit={handleSubmit} className="new-chat-form">
            <input
              type="tel"
              value={mobile}
              onChange={handleMobileChange}
              placeholder="Enter mobile number"
              required
            />
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Start Chat
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={toggleForm}
              >
                Cancel
              </button>
            </div>
          </form>
          {error && <div className="error-message">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default NewChatForm;