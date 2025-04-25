// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import UserMenu from './UserMenu';
import { FaBookMedical } from 'react-icons/fa';
import { FaQuestionCircle } from 'react-icons/fa';



const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Left side - Logo and title */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="logo" />
            <span className="text-xl font-semibold text-primary hover:text-primary-dark">
              Medical Forum
            </span>
          </Link>

          <Link 
            to="/medical-flashcards" 
            className="navbar-link flex items-center gap-2"
          >
            <FaBookMedical />
            Medical Reference
          </Link>

          <Link 
            to="/medical-questions" 
            className="navbar-link flex items-center gap-2"
          >
            <FaQuestionCircle />
            Medical Questions
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
