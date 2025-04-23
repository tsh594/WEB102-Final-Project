import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../config/supabase';
import { FaEdit, FaTrash, FaArrowLeft, FaStethoscope, FaHeart, FaBrain, FaHeadSideVirus, FaProcedures, FaBaby, FaSkull } from 'react-icons/fa';

const PostPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await supabase
          .from('posts')
          .delete()
          .eq('id', id);
        
        navigate('/');
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            author:profiles(name)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="mt-4">Loading post...</p>
    </div>
  );

  if (!post) return (
    <div className="glass-panel p-8 text-center">
      <p>Post not found</p>
      <Link to="/" className="btn btn-primary mt-4">
        <FaArrowLeft className="mr-2" />
        Back to homepage
      </Link>
    </div>
  );

  const getCategoryIcon = (category) => {
    const icons = {
      'Cardiology': <FaHeart />,
      'Oncology': <FaStethoscope />,
      'Neurology': <FaBrain />,
      'Psychiatry': <FaHeadSideVirus />,
      'Surgery': <FaProcedures />,
      'Pediatrics': <FaBaby />,
      'Radiology': <FaSkull />,
    };
    return icons[category] || <FaStethoscope />;
  };

  const getCategoryClass = (category) => {
    return `badge-${category.toLowerCase()}`;
  };

  return (
    <div className="glass-panel post-page">
      <div className="flex justify-between items-start mb-6">
        <Link to="/" className="btn btn-outline">
          <FaArrowLeft className="mr-2" />
          Back to all posts
        </Link>
        
        {user?.id === post.author_id && (
          <div className="flex gap-2">
            <Link
              to={`/posts/${post.id}/edit`}
              className="btn btn-primary"
            >
              <FaEdit className="mr-2" />
              Edit Post
            </Link>
            <button
              onClick={handleDelete}
              className="btn btn-danger"
            >
              <FaTrash className="mr-2" />
              Delete Post
            </button>
          </div>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      <div className="post-meta">
        <span className="post-meta-item">
          {post.author?.name || 'Anonymous'}
        </span>
        <span className="post-meta-item">
          Posted on {new Date(post.created_at).toLocaleDateString()}
        </span>
        {post.updated_at && (
          <span className="post-meta-item">
            Updated on {new Date(post.updated_at).toLocaleDateString()}
          </span>
        )}
        <span className={`badge ${post.post_type === 'Case Study' ? 'badge-oncology' : 
                         post.post_type === 'Research' ? 'badge-surgery' : 
                         'badge-general'}`}>
          {post.post_type}
        </span>
        <span className={`badge ${getCategoryClass(post.category)}`}>
          {getCategoryIcon(post.category)}
          {post.category}
        </span>
        {post.is_peer_reviewed && (
          <span className="badge badge-peer-reviewed">
            Peer Reviewed
          </span>
        )}
      </div>

      {post.image_url && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img 
            src={post.image_url} 
            alt="Post visual" 
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      )}

      <div 
        className="prose max-w-none mb-6"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.medical_references && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Medical References</h3>
          <div className="whitespace-pre-line">
            {post.medical_references}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostPage;