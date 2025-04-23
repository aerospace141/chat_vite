import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/api';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleMobileChange = (e) => {
    setMobile(e.target.value);
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await authService.login(mobile);
      setOtpSent(true);
      setError('');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Mobile not registered, ask to signup
        setError('Mobile number not registered. Please sign up first.');
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await authService.signup(mobile);
      setOtpSent(true);
      setError('');
    } catch (error) {
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // For development, we're mocking the OTP check
      // In production, we'd verify the OTP with the server
      const response = await authService.verifyOtp(mobile, otp);
      login({ mobile }, response.data.token);
      navigate('/');
    } catch (error) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Chat App</h2>
        {error && <div className="error-message">{error}</div>}
        
        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="mobile">Mobile Number</label>
              <input
                type="tel"
                id="mobile"
                value={mobile}
                onChange={handleMobileChange}
                placeholder="Enter your mobile number"
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleSignup}
              disabled={loading}
            >
              Sign Up Instead
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label htmlFor="otp">OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter OTP"
                required
              />
              <p className="otp-info">
                {/* In a real app, this would be sent via SMS */}
                For development, enter any 4-digit number as OTP
              </p>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;