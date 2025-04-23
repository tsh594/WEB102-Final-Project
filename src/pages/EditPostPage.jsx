// EditPostPage.jsx (final version)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../config/supabase';
import PostForm from '../components/PostForm';

const EditPostPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

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

        setPost({
          ...data,
          post_category: data.category,
          rawContent: data.raw_content
        });
      } catch (error) {
        setError(error.message);
        navigate('/');
      } finally {
        setFetching(false);
      }
    };

    fetchPost();
  }, [id, user, navigate]);

  const handleSubmit = async (formData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: formData.title,
          content: formData.content,
          raw_content: formData.rawContent,
          category: formData.post_category,
          is_peer_reviewed: formData.is_peer_reviewed,
          image_url: formData.image_url,
          post_type: formData.post_type,
          urgency_level: formData.urgency_level,
          medical_references: formData.medical_references,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      navigate(`/posts/${id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading post...</p>
    </div>
  );

  if (error) return (
    <div className="glass-panel p-8 text-center">
      <div className="text-red-600 font-semibold mb-4">{error}</div>
      <button 
        onClick={() => navigate('/')} 
        className="btn btn-primary"
      >
        Return to Home
      </button>
    </div>
  );

  return (
    <div className="container">
      <div className="glass-panel p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
        {post ? (
          <PostForm 
            post={post}
            onSubmit={handleSubmit} 
            isEditMode={true}
            loading={loading}
          />
        ) : (
          <div className="text-center py-8 text-gray-600">
            Post data not available
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPostPage;