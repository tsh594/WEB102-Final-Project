import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../auth/AuthContext';
import Avatar from './Avatar';

const CommentSection = ({ discussionId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
      } else {
        // Format comments to include complete user data
        const formattedComments = data.map(comment => ({
          ...comment,
          user: {
            id: comment.user_id,
            name: comment.profiles?.name || 'Anonymous',
            avatar_url: comment.profiles?.avatar_url || null
          }
        }));
        setComments(formattedComments);
      }
    };

    fetchComments();
  }, [discussionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        content: newComment,
        discussion_id: discussionId,
        user_id: user.id
      })
      .select();

    if (error) {
      console.error('Error adding comment:', error);
    } else {
      // Add the new comment with full user data
      const newCommentWithUser = {
        ...data[0],
        user: {
          id: user.id,
          name: user.user_metadata?.name || 'Anonymous',
          avatar_url: user.user_metadata?.avatar_url || null
        }
      };
      setComments([newCommentWithUser, ...comments]);
      setNewComment('');
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>
      
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <Avatar user={user} size="sm" />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add your comment..."
                className="w-full p-3 border rounded"
                rows="3"
              />
              <button
                type="submit"
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={!newComment.trim()}
              >
                Post Comment
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-blue-50 p-4 rounded mb-6 text-center">
          <a href="/login" className="text-blue-600 hover:underline">
            Sign in to comment
          </a>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 bg-gray-50 p-4 rounded">
            <Avatar user={comment.user} size="sm" />
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span className="font-medium text-gray-700">
                  {comment.user?.name || 'Anonymous'}
                </span>
                <span>
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-line">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;