import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import DiscussionForm from '../components/DiscussionForm';
import CommentSection from '../components/CommentSection';
import { supabase } from '../config/supabase';

const DiscussionPage = ({ mode = 'view' }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode !== 'create') {
      const fetchDiscussion = async () => {
        try {
          const { data, error: fetchError } = await supabase
            .from('discussions')
            .select(`
              id,
              title,
              content,
              created_at,
              upvotes,
              user_id,
              user:profiles(name)
            `)
            .eq('id', id)
            .single();

          if (fetchError) throw fetchError;

          setDiscussion(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchDiscussion();
    } else {
      setLoading(false);
    }
  }, [id, mode]);

  const handleSubmit = () => {
    navigate('/');
  };

  const handleDelete = async () => {
    try {
      // First delete all comments associated with this discussion
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .eq('discussion_id', id);

      if (commentsError) throw commentsError;

      // Then delete all votes associated with this discussion
      const { error: votesError } = await supabase
        .from('votes')
        .delete()
        .eq('discussion_id', id);

      if (votesError) throw votesError;

      // Finally delete the discussion itself
      const { error: discussionError } = await supabase
        .from('discussions')
        .delete()
        .eq('id', id);

      if (discussionError) throw discussionError;

      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading discussion...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  if (mode === 'create') {
    return <DiscussionForm mode="create" onSubmit={handleSubmit} />;
  }

  if (mode === 'edit') {
    return (
      <DiscussionForm
        mode="edit"
        initialData={discussion}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">{discussion.title}</h1>
        <div className="text-gray-600 mb-4">
          Posted by {discussion.user?.name || 'Anonymous'} on{' '}
          {new Date(discussion.created_at).toLocaleDateString()}
        </div>
        <div className="mb-6 whitespace-pre-line">{discussion.content}</div>
        
        {user && user.id === discussion.user_id && (
          <div className="flex space-x-4">
            <button
              onClick={() => navigate(`/discussions/${id}/edit`)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <CommentSection discussionId={id} />
    </div>
  );
};

export default DiscussionPage;