import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../config/supabase';
import PostForm from '../components/PostForm';

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

  if (loading) return <div>Loading post...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="page-container">
      <h1>Edit Post</h1>
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