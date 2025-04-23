import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const VerifyPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerification } = useAuth();
  const email = location.state?.email || '';

  const handleResend = async () => {
    try {
      await resendVerification(email);
      alert('Verification email resent! Please check your inbox.');
    } catch (err) {
      alert('Failed to resend verification email. Please try again later.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
      <p className="mb-4">
        We've sent a verification link to <strong>{email}</strong>.
        Please check your inbox and click the link to activate your account.
      </p>
      
      <div className="space-y-3">
        <button
          onClick={handleResend}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Resend Verification Email
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyPending;