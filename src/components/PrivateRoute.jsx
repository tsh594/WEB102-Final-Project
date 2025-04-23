import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;