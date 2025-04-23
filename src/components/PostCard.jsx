import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { FaEdit, FaTrash, FaEye, FaStethoscope, FaHeart, FaBrain, FaHeadSideVirus, FaProcedures, FaBaby, FaSkull } from 'react-icons/fa';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();

  const getCategoryIcon = (category) => {
    const icons = {
      'Cardiology': <FaHeart className="mr-1" />,
      'Oncology': <FaStethoscope className="mr-1" />,
      'Neurology': <FaBrain className="mr-1" />,
      'Psychiatry': <FaHeadSideVirus className="mr-1" />,
      'Surgery': <FaProcedures className="mr-1" />,
      'Pediatrics': <FaBaby className="mr-1" />,
      'Radiology': <FaSkull className="mr-1" />,
    };
    return icons[category] || <FaStethoscope className="mr-1" />;
  };

  const getCategoryClass = (category) => {
    if (!category) return 'badge-general'; // Add null check
    return `badge-${category.toLowerCase()}`;
  };

  return (
    <div className="glass-panel post-card">
      <div className="post-header">
        <Link to={`/posts/${post.id}`} className="post-title">
          {post.title}
        </Link>
        
        <div className="post-actions">
          {post.is_peer_reviewed && (
            <span className="badge badge-peer-reviewed">
              Peer Reviewed
            </span>
          )}
          {user?.id === post.author_id && (
            <>
              <Link
                to={`/posts/${post.id}/edit`}
                className="btn btn-outline btn-sm"
              >
                <FaEdit className="mr-1" />
                Edit
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(post.id);
                }}
                className="btn btn-danger btn-sm"
              >
                <FaTrash className="mr-1" />
                Delete
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
        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
          <span className="post-meta-item">
            {post.author?.name || 'Anonymous'}
          </span>
          <span className="post-meta-item">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
          {/* Changed post.category to post.post_category */}
          <span className={`badge ${getCategoryClass(post.post_category)}`}>
            {getCategoryIcon(post.post_category)}
            {post.post_category}
          </span>
        </div>

        <div className="mb-4 line-clamp-3">
          {/* Added optional chaining for raw_content */}
          {post.raw_content?.substring(0, 200)}{post.raw_content?.length > 200 ? '...' : ''}
        </div>

        <div className="flex justify-between items-center">
          <span className={`badge ${post.post_type === 'Case Study' ? 'badge-oncology' : 
                           post.post_type === 'Research' ? 'badge-surgery' : 
                           'badge-general'}`}>
            {post.post_type}
          </span>
          <Link 
            to={`/posts/${post.id}`} 
            className="text-sm font-medium text-primary hover:underline"
          >
            Read full post →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;