import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../config/supabase';
import PostForm from '../components/PostForm';

const CreatePostPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    if (!user) {
      alert('You must be logged in to create a post');
      return;
    }
    
    // Validate required fields
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required');
      return;
    }

    if (!formData.post_category || !formData.post_type) {
      alert('Please select a category and post type');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: formData.title,
          content: formData.content,
          raw_content: formData.rawContent,
          category: formData.post_category,
          is_peer_reviewed: formData.is_peer_reviewed || false,
          image_url: formData.image_url || null,
          post_type: formData.post_type,
          urgency_level: formData.urgency_level || 0,
          medical_references: formData.medical_references || null,
          author_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      navigate(`/posts/${data.id}`);
    } catch (error) {
      console.error('Full error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        status: error.status
      });
      
      let errorMessage = 'Failed to create post';
      if (error.details) errorMessage += `: ${error.details}`;
      else if (error.message) errorMessage += `: ${error.message}`;
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="glass-panel p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
        <PostForm 
          onSubmit={handleSubmit} 
          isEditMode={false}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CreatePostPage;