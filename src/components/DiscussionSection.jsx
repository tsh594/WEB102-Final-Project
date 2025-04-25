import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../config/supabase';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import '../index.css';

const DiscussionSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            created_at,
            user_id,
            profiles!inner (
              name,
              avatar_url
            )
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        const formattedComments = data.map(comment => ({
          ...comment,
          user: {
            id: comment.user_id,
            name: comment.profiles.name,
            avatar_url: comment.profiles.avatar_url
          }
        }));
        
        setComments(formattedComments);
      } catch (err) {
        setError('Failed to load comments');
        console.error('Error fetching comments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          content: newComment
        }])
        .select();

      if (error) throw error;
      
      const { data: userData } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single();

      const newCommentWithUser = {
        ...data[0],
        user: {
          id: user.id,
          name: userData?.name || 'Anonymous',
          avatar_url: userData?.avatar_url || ''
        }
      };
      
      setComments([...comments, newCommentWithUser]);
      setNewComment('');
    } catch (err) {
      setError('Failed to post comment');
      console.error('Error posting comment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="discussion-container">
      <div className="discussion-header">
        <h3>Discussion</h3>
        <span className="discussion-count">{comments.length} comments</span>
      </div>

      {error && <div className="discussion-error">{error}</div>}

      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="comment-input-group">
            <div className="comment-avatar">
              <Avatar user={user} size="sm" />
            </div>
            <div className="comment-input-container">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="comment-textarea"
                rows="3"
                disabled={loading}
              />
              <button
                type="submit"
                className="comment-submit-btn"
                disabled={!newComment.trim() || loading}
              >
                {loading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <Link to="/login" className="comment-login-link">
            Sign in to participate in the discussion
          </Link>
        </div>
      )}

      {loading && comments.length === 0 ? (
        <div className="comment-loading">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="comment-empty">No discussions yet. Be the first to comment!</div>
      ) : (
        <div className="comment-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-avatar">
                <Avatar user={comment.user} size="sm" />
              </div>
              <div className="comment-content">
                <div className="comment-meta">
                  <span className="comment-author">{comment.user.name}</span>
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="comment-text">{comment.content}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscussionSection;