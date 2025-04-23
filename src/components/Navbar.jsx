import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import UserMenu from './UserMenu';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Brand logo */}
          <Link to="/" className="text-2xl font-bold text-primary hover:text-primary-dark">
            Medical Forum
          </Link>

          {/* Right side - Navigation items */}
          <div className="flex items-center space-x-4">
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;