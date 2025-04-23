import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const Avatar = ({ user, size = 'md', imageUrl, onClick }) => {
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
  const userName = user?.user_metadata?.name || 
                 user?.user_metadata?.full_name || 
                 authUser?.user_metadata?.name || 
                 'User';

  const avatarImage = imageUrl || user?.user_metadata?.avatar_url;
  const statusClass = user ? 'avatar-online' : '';
  const sizeClass = `avatar-${size}`;

  // Add cache busting query parameter
  const imageWithCacheBust = avatarImage ? 
    `${avatarImage}?${new Date().getTime()}` : 
    null;

  return (
    <div 
      className={`avatar ${sizeClass} ${statusClass} avatar-fixed`}
      onClick={onClick}
      tabIndex={onClick ? 0 : -1}
    >
      {imageWithCacheBust && !imgError ? (
        <img 
          src={imageWithCacheBust}
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