import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../auth/AuthContext';

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
          user:profiles(name)
        `)
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching comments:', error);
      else setComments(data);
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
      setComments([data[0], ...comments]);
      setNewComment('');
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>
      
      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
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
          >
            Post Comment
          </button>
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-4 rounded">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>{comment.user?.name || 'Anonymous'}</span>
              <span>{new Date(comment.created_at).toLocaleString()}</span>
            </div>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;