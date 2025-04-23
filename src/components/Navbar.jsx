// Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import UserMenu from './UserMenu';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Medical Forum
        </Link>
        
        <div className="navbar-menu">
          {user && (
            <Link
              to="/posts/new"
              className="btn btn-accent"
            >
              Create Post
            </Link>
          )}
          <UserMenu user={user} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;