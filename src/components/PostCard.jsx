import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  FaEdit, FaTrash, FaEye, FaStethoscope,
  FaHeart, FaBrain, FaHeadSideVirus,
  FaProcedures, FaBaby, FaSkull, FaThumbsUp
} from 'react-icons/fa';
import '../index.css';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();

  if (!post) return null;

  // Fixed urgency calculation function
  const getUrgencyBadge = (level) => {
    const numericLevel = Number(level) || 0;
    const clampedLevel = Math.max(0, Math.min(numericLevel, 5));
    
    const levels = [
      { class: 'badge-urgency-0', label: 'Routine' },
      { class: 'badge-urgency-1', label: 'Low' },
      { class: 'badge-urgency-2', label: 'Moderate' },
      { class: 'badge-urgency-3', label: 'High' },
      { class: 'badge-urgency-4', label: 'Critical' },
      { class: 'badge-urgency-5', label: 'Emergency' }
    ];
    
    return levels[clampedLevel] || levels[0];
  };

  // Rest of the component remains the same
  const getCategoryIcon = (category) => {
    const icons = {
      'Cardiology': <FaHeart className="category-icon" />,
      'Oncology': <FaStethoscope className="category-icon" />,
      'Neurology': <FaBrain className="category-icon" />,
      'Psychiatry': <FaHeadSideVirus className="category-icon" />,
      'Surgery': <FaProcedures className="category-icon" />,
      'Pediatrics': <FaBaby className="category-icon" />,
      'Radiology': <FaSkull className="category-icon" />,
    };
    return icons[category] || <FaStethoscope className="category-icon" />;
  };

  const getCategoryClass = (category) => {
    if (!category) return 'badge-general';
    return `badge-${category.toLowerCase().replace(' ', '-')}`;
  };

  const urgency = getUrgencyBadge(post?.urgency_level);

  return (
    <div className="glass-panel post-card">
      <div className="post-header">
        <Link to={`/posts/${post?.id}`} className="post-title">
          {post?.title || 'Untitled Post'}
        </Link>
        
        <div className="post-actions">
          {post?.is_peer_reviewed && (
            <span className="badge badge-peer-reviewed">
              Peer Reviewed
            </span>
          )}

          {post?.image_url && (
            <div className="media-preview">
              <img 
                src={post.image_url} 
                alt="Post visual" 
                className="post-image"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}

          {user?.id === post?.author_id && (
            <>
              <Link
                to={`/posts/${post?.id}/edit`}
                className="btn btn-edit"
              >
                <FaEdit />
                <span>Edit</span>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(post?.id);
                }}
                className="btn btn-delete"
              >
                <FaTrash />
                <span>Delete</span>
              </button>
            </>
          )}
          <Link
            to={`/posts/${post.id}`}
            className="btn btn-primary btn-sm"
          >
            <FaEye className="mr-1" />
            View
          </Link>
        </div>
      </div>

      <div className="post-content">
        <div className="post-meta-container">
          <span className="post-meta-item">
            {post?.author?.name || 'Anonymous'}
          </span>
          <span className="post-meta-item">
            {post?.created_at ? new Date(post.created_at).toLocaleDateString() : 'No date'}
          </span>
          <span className={`badge ${getCategoryClass(post?.post_category)}`}>
            {getCategoryIcon(post?.post_category)}
            {post?.post_category || 'General'}
          </span>

          {/* Safely rendered urgency badge */}
          {urgency && (
            <span className={`badge ${urgency.class}`}>
              Urgency: {urgency.label}
            </span>
          )}

          <span className="post-meta-item vote-count">
            <FaThumbsUp />
            <span>{post?.votes ?? 0}</span>
          </span>
        </div>

        <div className="post-excerpt">
          {post?.raw_content?.substring(0, 200) || 'No content available'}
          {(post?.raw_content?.length || 0) > 200 ? '...' : ''}
        </div>

        <div className="post-footer">
          <span className={`badge ${
            post?.post_type === 'Case Study' ? 'badge-case-study' : 
            post?.post_type === 'Research' ? 'badge-research' : 
            'badge-general'
          }`}>
            {post?.post_type || 'Post'}
          </span>
          <Link 
            to={`/posts/${post?.id}`} 
            className="read-more-link"
          >
            Read full post →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;