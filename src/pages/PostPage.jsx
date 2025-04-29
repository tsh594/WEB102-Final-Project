import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { usePosts } from '../context/PostsContext';
import { supabase } from '../config/supabase';
import DOMPurify from 'dompurify';
import {
  FaEdit, FaTrash, FaArrowLeft, FaStethoscope,
  FaHeart, FaBrain, FaHeadSideVirus, FaProcedures,
  FaBaby, FaSkull, FaThumbsUp, FaFilePdf,
  FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaFile
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
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchPostData = async () => {
      try {
        setLoading(true);
        setError('');

        const { data, error: postError } = await supabase
          .from('posts')
          .select(`
            *,
            author:profiles!fk_author(name),
            attachments
          `)
          .eq('id', id)
          .single();

        if (abortController.signal.aborted) return;
        if (postError) throw postError;
        if (!data) throw new Error('Post not found');

        // Process attachments
        const validAttachments = (data.attachments || []).filter(
          a => a?.url && ['image', 'video', 'file'].includes(a?.type)
        );

        setPost(data);
        setAttachments(validAttachments);

        // Fetch votes if not cached
        if (!postsCache[id]) {
          const { data: votesData } = await supabase
            .from('post_votes')
            .select('user_id')
            .eq('post_id', id)
            .eq('direction', 1);

          const upvotes = votesData?.length || 0;
          const voted = user ? votesData?.some(v => v.user_id === user.id) : false;
          
          setPostVotes(upvotes);
          setUserVoted(voted);
          updatePostVotes(id, upvotes, voted);
        }

      } catch (err) {
        if (!abortController.signal.aborted) {
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
    if (!user) return navigate('/login');

    setIsVoting(true);
    try {
      const newVotedState = !userVoted;
      const newVotes = newVotedState ? postVotes + 1 : postVotes - 1;
      
      // Optimistic update
      setPostVotes(newVotes);
      setUserVoted(newVotedState);
      updatePostVotes(id, newVotes, newVotedState);

      // Sync with server
      if (newVotedState) {
        await supabase
          .from('post_votes')
          .upsert({ post_id: id, user_id: user.id, direction: 1 });
      } else {
        await supabase
          .from('post_votes')
          .delete()
          .match({ post_id: id, user_id: user.id });
      }

    } catch (err) {
      // Rollback on error
      setPostVotes(prev => prev + (userVoted ? 1 : -1));
      setUserVoted(prev => !prev);
      updatePostVotes(id, postVotes, userVoted);
      setError('Vote failed: ' + err.message);
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
      setError('Failed to delete post: ' + err.message);
    }
  };

  useEffect(() => {
    if (!post) return;

    const handleMedia = () => {
      // Add zoom functionality
      document.querySelectorAll('.post-content img').forEach(img => {
        if (!img.closest('.zoom-container')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'zoom-container';
          img.replaceWith(wrapper);
          wrapper.appendChild(img);
          img.classList.add('zoomable-image');
        }
      });

      // Handle media errors
      document.querySelectorAll('.post-content img, .post-content video').forEach(el => {
        el.addEventListener('error', () => {
          el.style.display = 'none';
          el.parentElement?.remove();
        });
      });
    };

    const observer = new MutationObserver(handleMedia);
    const contentEl = document.querySelector('.post-content');
    if (contentEl) {
      observer.observe(contentEl, { childList: true, subtree: true });
      handleMedia();
    }

    return () => observer.disconnect();
  }, [post]);

  const getFileIcon = (url) => {
    if (!url) return <FaFile className="file-icon generic" />;
    
    const ext = url.split('.').pop()?.toLowerCase() || 'generic';
    const icons = {
      pdf: <FaFilePdf className="file-icon pdf" />,
      doc: <FaFileWord className="file-icon doc" />,
      docx: <FaFileWord className="file-icon doc" />,
      xls: <FaFileExcel className="file-icon xls" />,
      xlsx: <FaFileExcel className="file-icon xls" />,
      ppt: <FaFilePowerpoint className="file-icon ppt" />,
      pptx: <FaFilePowerpoint className="file-icon ppt" />,
      zip: <FaFileArchive className="file-icon zip" />,
      jpg: <FaFile className="file-icon image" />,
      png: <FaFile className="file-icon image" />,
      mp4: <FaFile className="file-icon video" />,
      generic: <FaFile className="file-icon generic" />
    };
    
    return icons[ext] || icons.generic;
  };

  const getCategoryIcon = (cat) => ({
    Cardiology: <FaHeart />,
    Oncology: <FaStethoscope />,
    Neurology: <FaBrain />,
    Psychiatry: <FaHeadSideVirus />,
    Surgery: <FaProcedures />,
    Pediatrics: <FaBaby />,
    Radiology: <FaSkull />
  }[cat] || <FaStethoscope />);

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p className="loading-text">Loading post...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p className="error-message">{error}</p>
      <Link to="/" className="back-button">
        <FaArrowLeft className="icon-spacing" /> Back to Home
      </Link>
    </div>
  );

  if (!post) return (
    <div className="not-found-container">
      <p className="not-found-message">Post not found</p>
      <Link to="/" className="back-button">
        <FaArrowLeft className="icon-spacing" /> Back to Home
      </Link>
    </div>
  );

  return (
    <div className="glass-panel post-page-container">
      <div className="post-header">
        <Link to="/" className="btn btn-outline-a">
          <FaArrowLeft className="icon-spacing" /> All Posts
        </Link>
        {user?.id === post.author_id && (
          <div className="author-controls">
            <Link to={`/posts/${post.id}/edit`} className="btn btn-outline-a">
              <FaEdit className="icon-spacing" /> Edit Post
            </Link>
            <button onClick={handleDelete} className="btn btn-outline-danger">
              <FaTrash className="icon-spacing" /> Delete Post
            </button>
          </div>
        )}
      </div>

      <h1 className="post-title">{post.title}</h1>

      <div className="post-meta">
        <span className="meta-item author">{post.author?.name || 'Anonymous'}</span>
        <span className="meta-item date">
          Posted {new Date(post.created_at).toLocaleDateString()}
        </span>
        {post.updated_at && (
          <span className="meta-item date">
            Updated {new Date(post.updated_at).toLocaleDateString()}
          </span>
        )}
        <span className={`category-badge ${post.post_category?.toLowerCase()}`}>
          {getCategoryIcon(post.post_category)} {post.post_category}
        </span>
      </div>

      {attachments.length > 0 && (
        <div className="attachments-grid">
          {attachments.map((attachment, index) => (
            <div key={index} className="attachment-item">
              {attachment.type === 'image' ? (
                <img 
                  src={attachment.url} 
                  alt={attachment.name || 'Post attachment'} 
                  className="zoomable-image"
                  loading="lazy"
                />
              ) : attachment.type === 'video' ? (
                <video controls className="media-attachment">
                  <source src={attachment.url} type="video/mp4" />
                </video>
              ) : (
                <a 
                  href={attachment.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="file-attachment"
                >
                  {getFileIcon(attachment.url)}
                  <span>{attachment.name || 'Download File'}</span>
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        className="post-content"
        dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(post.content, {
            ADD_TAGS: ['video'],
            ADD_ATTR: ['controls', 'src', 'alt', 'preload']
          })
        }}
      />

      <div className="vote-section">
        <button
          type="button"
          onClick={handleUpvote}
          className={`vote-button ${userVoted ? 'voted' : ''}`}
          disabled={!user || isVoting}
        >
          <FaThumbsUp className="icon-spacing" />
          <span className="vote-count">{postVotes}</span>
        </button>
      </div>

      <DiscussionSection postId={post.id} currentUser={user} />
    </div>
  );
};

export default PostPage;