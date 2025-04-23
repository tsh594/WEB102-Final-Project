import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VerifySuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center">
      <h2 className="text-2xl font-bold mb-4">Email Verified!</h2>
      <p className="mb-4">Your account has been successfully activated.</p>
      <p>You will be redirected to the login page in 5 seconds...</p>
    </div>
  );
};

export default VerifySuccess;