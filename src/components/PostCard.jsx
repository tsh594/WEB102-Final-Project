import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { 
  FaEdit, FaTrash, FaEye, FaStethoscope,
  FaHeart, FaBrain, FaHeadSideVirus,
  FaProcedures, FaBaby, FaSkull, FaThumbsUp,
  FaFlask, FaBook, FaQuestionCircle, FaComments
} from 'react-icons/fa';
import '../index.css';

const medicalSpecialties = [
  { name: 'General Medicine', color: '#4CAF50', icon: '🩺' },
  { name: 'Radiology', color: '#9C27B0', icon: '📷' },
  { name: 'Cardiology', color: '#F44336', icon: '❤️' },
  { name: 'Neurology', color: '#3F51B5', icon: '🧠' },
  { name: 'Oncology', color: '#FF5722', icon: '🦠' },
  { name: 'Pediatrics', color: '#FFC107', icon: '👶' },
  { name: 'Orthopedics', color: '#795548', icon: '🦴' },
  { name: 'Dermatology', color: '#FF9800', icon: '👩⚕️' },
  { name: 'Gastroenterology', color: '#8BC34A', icon: '🍏' },
  { name: 'Endocrinology', color: '#E91E63', icon: '⚖️' },
  { name: 'Pulmonology', color: '#00BCD4', icon: '🌬️' },
  { name: 'Nephrology', color: '#673AB7', icon: '💧' },
  { name: 'Hematology', color: '#F44336', icon: '🩸' },
  { name: 'Rheumatology', color: '#FF7043', icon: '🦵' },
  { name: 'Infectious Diseases', color: '#CDDC39', icon: '🦠' },
  { name: 'Emergency Medicine', color: '#F44336', icon: '🚑' },
  { name: 'Family Medicine', color: '#4CAF50', icon: '👪' },
  { name: 'Psychiatry', color: '#9C27B0', icon: '🧠' },
  { name: 'Obstetrics/Gynecology', color: '#E91E63', icon: '🤰' },
  { name: 'Urology', color: '#3F51B5', icon: '🚹' },
  { name: 'Ophthalmology', color: '#00BCD4', icon: '👁️' },
  { name: 'Otolaryngology', color: '#795548', icon: '👂' },
  { name: 'Anesthesiology', color: '#607D8B', icon: '💉' },
  { name: 'Pathology', color: '#9E9E9E', icon: '🔬' }
];

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!post) return null;

  // Urgency badge calculation
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

  // Get specialty details
  const getSpecialtyDetails = (category) => {
    return medicalSpecialties.find(s => s.name === category) || 
      { name: 'General Medicine', color: '#4CAF50', icon: '🩺' };
  };

  // Image handlers
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.parentElement.classList.add('image-error');
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const urgency = getUrgencyBadge(post?.urgency_level);
  const specialty = getSpecialtyDetails(post?.post_category);

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

      {/* Image Preview Section */}
      {post?.image_url && (
        <div className="post-media-preview">
          <div className="image-container">
            <img 
              src={post.image_url}
              alt="Post visual content"
              className={`post-preview-image ${imageLoaded ? 'loaded' : ''}`}
              loading="lazy"
              width={300}
              height={200}
              onClick={() => handleImageClick(post.image_url)}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            {!imageLoaded && (
              <div className="image-placeholder">
                <div className="spinner"></div>
              </div>
            )}
            <div className="image-hover-text">Click to zoom</div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {showImageModal && (
        <div className="image-modal" onClick={() => setShowImageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage} 
              alt="Enlarged content" 
              className="zoomed-image"
            />
            <button 
              className="close-modal"
              onClick={() => setShowImageModal(false)}
              aria-label="Close image"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <div className="post-content">
        <div className="post-meta-container">
          <span className="post-meta-item">
            {post?.author?.name || 'Anonymous'}
          </span>
          <span className="post-meta-item">
            {post?.created_at ? new Date(post.created_at).toLocaleDateString() : 'No date'}
          </span>
          <span 
            className="badge category-badge"
            style={{ backgroundColor: specialty.color }}
          >
            <span className="category-icon">{specialty.icon}</span>
            {specialty.name}
          </span>

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
            post?.post_type === 'Question' ? 'badge-question' :
            'badge-discussion'
          }`}>
            {post?.post_type === 'Case Study' ? <FaBook className="mr-1" /> :
            post?.post_type === 'Research' ? <FaFlask className="mr-1" /> :
            post?.post_type === 'Question' ? <FaQuestionCircle className="mr-1" /> :
            <FaComments className="mr-1" />}
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