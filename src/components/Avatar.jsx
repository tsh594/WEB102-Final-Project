import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const Avatar = ({ user, size = 'md', onClick }) => {
  const [imgError, setImgError] = useState(false);
  const { user: authUser } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'US';
    const names = name.trim().split(' ');
    return names
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user data from multiple possible sources
  const userName = user?.name || 
                 user?.user_metadata?.name || 
                 user?.user_metadata?.full_name || 
                 authUser?.user_metadata?.name || 
                 'User';

  const avatarImage = user?.avatar_url || 
                    user?.user_metadata?.avatar_url;
  
  // Size classes mapping
  const sizeClass = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl'
  }[size] || 'avatar-md';

  // Status indicator if user is online
  const statusClass = user ? 'avatar-online' : '';

  return (
    <div 
      className={`avatar ${sizeClass} ${statusClass}`}
      onClick={onClick}
      tabIndex={onClick ? 0 : -1}
    >
      {avatarImage && !imgError ? (
        <img 
          src={avatarImage}
          alt="Profile" 
          className="avatar-img"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="avatar-initials">
          {getInitials(userName)}
        </span>
      )}
    </div>
  );
};

export default Avatar;