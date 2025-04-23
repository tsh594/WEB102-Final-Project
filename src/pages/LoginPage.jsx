import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          {showResend && (
            <button
              onClick={handleResend}
              className="mt-2 text-blue-600 hover:underline block"
            >
              Resend verification email
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
      </form>

      <div className="mt-4 text-center space-y-2">
        <div>
          <Link to="/register" className="text-blue-600 hover:underline">
            Create new account
          </Link>
        </div>
        <div>
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;