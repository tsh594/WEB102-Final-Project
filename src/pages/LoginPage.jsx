import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowResend(false);

    try {
      await login(credentials.email, credentials.password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.message.includes('verify your email')) {
        setError('Please verify your email before signing in');
        setShowResend(true);
      } else {
        setError(err.message || 'Invalid email or password');
      }
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification(credentials.email);
      setError('Verification email sent! Please check your inbox.');
      setShowResend(false);
    } catch (err) {
      setError('Failed to resend verification email');
    }
  };

  return (
    <div className="login-container">
      <h2>Sign In</h2>
      
      {error && (
        <div className="error-message">
          {error}
          {showResend && (
            <button onClick={handleResend} className="resend-button">
              Resend verification email
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Sign In
        </button>
      </form>

      <div className="login-links">
        <Link to="/register">Create new account</Link>
        <Link to="/forgot-password">Forgot password?</Link>
      </div>
    </div>
  );
};

export default LoginPage;