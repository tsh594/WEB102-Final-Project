import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../config/supabase';
import PostForm from '../components/PostForm';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const EditPostPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data.author_id !== user?.id) {
          navigate('/');
          return;
        }

        setPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError('');
      
      const { error } = await supabase
        .from('posts')
        .update(formData)
        .eq('id', id);

      if (error) throw error;
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container">Loading post...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="glass-panel post-page">
      <div className="flex justify-between items-start mb-6">
        <Link to="/" className="btn btn-outline">
          <FaArrowLeft className="mr-2" />
          Back to all posts
        </Link>
        
        <div className="flex gap-2">
          <Link
            to="/posts/new"
            className="btn btn-primary"
          >
            <FaPlus className="mr-2" />
            Create New Post
          </Link>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
      
      {post && (
        <PostForm 
          post={post}
          onSubmit={handleSubmit}
          isEditMode={true}
          loading={loading}
        />
      )}
    </div>
  );
};

export default EditPostPage;