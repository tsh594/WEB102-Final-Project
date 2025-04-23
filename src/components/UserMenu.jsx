import { useRef, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';

const UserMenu = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <Avatar user={user} onClick={() => setIsOpen(!isOpen)} />
      
      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <p className="user-menu-name">
              {user?.user_metadata?.name}
            </p>
            <p className="user-menu-email">
              {user?.email}
            </p>
          </div>
          
          <button
            onClick={() => navigate('/profile')}
            className="user-menu-item"
          >
            My Profile
          </button>
          
          <button
            onClick={handleLogout}
            className="user-menu-item user-menu-item-danger"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;