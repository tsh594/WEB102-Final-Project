import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../config/supabase';
import PostForm from '../components/PostForm';

const CreatePostPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    if (!user) {
      setError('You must be logged in');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const { data, error: supabaseError } = await supabase
        .from('posts')
        .insert({
          ...formData,
          author_id: user.id
        })
        .select();

      if (supabaseError) throw supabaseError;
      
      navigate(`/posts/${data[0].id}`);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container glass-panel">
      <h1 className="page-title">Create New Post</h1>
      {error && <div className="error-message">{error}</div>}
      <PostForm 
        onSubmit={handleSubmit}
        isEditMode={false}
        loading={loading}
      />
    </div>
  );
};

export default CreatePostPage;