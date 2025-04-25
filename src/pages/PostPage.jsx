import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { usePosts } from '../context/PostsContext';
import { supabase } from '../config/supabase';
import {
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaStethoscope,
  FaHeart,
  FaBrain,
  FaHeadSideVirus,
  FaProcedures,
  FaBaby,
  FaSkull,
  FaThumbsUp
} from 'react-icons/fa';
import DiscussionSection from '../components/DiscussionSection';

const PostPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { postsCache, updatePostVotes } = usePosts();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [postVotes, setPostVotes] = useState(postsCache[id]?.votes || 0);
  const [userVoted, setUserVoted] = useState(postsCache[id]?.userVoted || false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchPostData = async () => {
      try {
        setLoading(true);
        setError('');

        // Set initial state from cache
        const cachedVotes = postsCache[id];
        if (cachedVotes) {
          setPostVotes(cachedVotes.votes);
          setUserVoted(cachedVotes.userVoted);
        }

        // Fetch post content
        const { data, error: postError } = await supabase
          .from('posts')
          .select(`
            *,
            author:profiles!fk_author(name)
          `)
          .eq('id', id)
          .single();

        if (abortController.signal.aborted) return;

        if (postError) throw postError;
        if (!data) throw new Error('Post not found');
        setPost(data);

        // Fetch votes if no cache exists
        if (!cachedVotes) {
          const { data: votesData, error: votesError } = await supabase
            .from('post_votes')
            .select('user_id')
            .eq('post_id', id)
            .eq('direction', 1);

          if (votesError) throw votesError;

          const upvotes = votesData.length;
          const voted = user ? 
            votesData.some(v => v.user_id === user.id) : 
            false;

          setPostVotes(upvotes);
          setUserVoted(voted);
          updatePostVotes(id, upvotes, voted);
        }

      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error('Fetch error:', err);
          setError(err.message || 'Failed to load post');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPostData();
    return () => abortController.abort();
  }, [id, user, postsCache, updatePostVotes]);

  const handleUpvote = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to vote!');
      return navigate('/login');
    }

    setIsVoting(true);
    try {
      const newVotedState = !userVoted;
      const newVotes = newVotedState ? postVotes + 1 : postVotes - 1;
      
      // Optimistic UI update
      setPostVotes(newVotes);
      setUserVoted(newVotedState);
      updatePostVotes(id, newVotes, newVotedState);

      // Server sync
      if (newVotedState) {
        const { error } = await supabase
          .from('post_votes')
          .upsert(
            { 
              post_id: id, 
              user_id: user.id, 
              direction: 1 
            },
            { 
              onConflict: 'post_id,user_id',
              returning: 'minimal'
            }
          );
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_votes')
          .delete()
          .match({ post_id: id, user_id: user.id });
        if (error) throw error;
      }

    } catch (err) {
      // Rollback on error
      setPostVotes(prev => prev + (userVoted ? 1 : -1));
      setUserVoted(prev => !prev);
      updatePostVotes(id, postVotes, userVoted);
      console.error('Vote error:', err);
      setError(`Vote failed: ${err.message}`);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      navigate('/');
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete post');
    }
  };

  useEffect(() => {
    if (!post) return;
    
    const wrapImg = img => {
      if (img.parentElement.classList.contains('zoom-container')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'zoom-container';
      img.replaceWith(wrapper);
      wrapper.appendChild(img);
      img.classList.add('zoomable-image');
    };

    document.querySelectorAll('.featured-zoomable').forEach(wrapImg);
    document.querySelectorAll('.post-content img').forEach(wrapImg);
  }, [post]);

  const getCategoryIcon = cat => ({
    Cardiology: <FaHeart />,
    Oncology:   <FaStethoscope />,
    Neurology:  <FaBrain />,
    Psychiatry: <FaHeadSideVirus />,
    Surgery:    <FaProcedures />,
    Pediatrics: <FaBaby />,
    Radiology:  <FaSkull />
  }[cat] || <FaStethoscope />);

  const getBadgeClass = c =>
    c ? `badge-${c.toLowerCase()}` : 'badge-general';

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p className="mt-4">Loading post...</p>
    </div>
  );

  if (error) return (
    <div className="glass-panel p-8 text-center">
      <p className="text-danger mb-4">{error}</p>
      <Link to="/" className="btn btn-primary">
        <FaArrowLeft className="mr-2" /> Back
      </Link>
    </div>
  );

  if (!post) return (
    <div className="glass-panel p-8 text-center">
      <p>Post not found</p>
      <Link to="/" className="btn btn-primary mt-4">
        <FaArrowLeft className="mr-2" /> Back
      </Link>
    </div>
  );

  return (
    <div className="glass-panel post-page">
      <div className="flex justify-between items-start mb-6">
        <Link to="/" className="btn btn-outline">
          <FaArrowLeft className="mr-2" /> All Posts
        </Link>
        {user?.id === post.author_id && (
          <div className="flex gap-2">
            <Link to={`/posts/${post.id}/edit`} className="btn btn-primary">
              <FaEdit className="mr-2" /> Edit Post
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
              <FaTrash className="mr-2" /> Delete Post
            </button>
          </div>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      <div className="post-meta flex flex-wrap gap-4 items-center mb-6">
        <span className="post-meta-item">{post.author?.name || 'Anonymous'}</span>
        <span className="post-meta-item">
          Posted {new Date(post.created_at).toLocaleDateString()}
        </span>
        {post.updated_at && (
          <span className="post-meta-item">
            Updated {new Date(post.updated_at).toLocaleDateString()}
          </span>
        )}
        <span className={`badge ${getBadgeClass(post.post_category)}`}>
          {getCategoryIcon(post.post_category)} {post.post_category}
        </span>
      </div>

      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post visual"
          className="zoomable-image featured-zoomable mb-6"
        />
      )}

      <div
        className="post-content prose max-w-none mb-6"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="vote-section mb-6">
        <button
          type="button"
          onClick={handleUpvote}
          className={`vote-btn ${userVoted ? 'btn-up' : 'btn-secondary-a'}`}
          disabled={!user || isVoting}
          aria-label="Upvote"
        >
          <FaThumbsUp />
        </button>
        <span className="vote-count">{postVotes}</span>
      </div>

      <DiscussionSection postId={post.id} currentUser={user} />
    </div>
  );
};

export default PostPage;