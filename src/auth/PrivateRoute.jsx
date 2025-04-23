// In PrivateRoute.jsx
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="loading-spinner-container">Loading...</div>;
  
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};