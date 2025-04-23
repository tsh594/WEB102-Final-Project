// Avatar.jsx
import { useAuth } from '../auth/AuthContext';

const Avatar = ({ user, size = 'md', imageUrl, onClick }) => {
  const getInitials = (name) => {
    if (!name) return 'US';
    const names = name.trim().split(' ');
    return names
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl'
  };

  const statusClasses = user ? 'avatar-online' : '';
  const avatarImage = imageUrl || user?.user_metadata?.avatar_url;

  return (
    <div 
      className={`avatar ${sizeClasses[size]} ${statusClasses}`}
      onClick={onClick}
      tabIndex={onClick ? 0 : -1}
    >
      {avatarImage ? (
        <img 
          src={avatarImage} 
          alt="Profile" 
          className="avatar-img"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <span className="avatar-initials">
          {getInitials(user?.user_metadata?.name)}
        </span>
      )}
    </div>
  );
};

export default Avatar;