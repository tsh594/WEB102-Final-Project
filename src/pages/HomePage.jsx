// HomePage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../config/supabase';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { FaSortAmountDown, FaFilter, FaFileMedical } from 'react-icons/fa';

const HomePage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const medicalCategories = [
    'all', 'General', 'Cardiology', 'Oncology', 'Pediatrics',
    'Neurology', 'Surgery', 'Psychiatry', 'Radiology'
  ];

  const postTypes = [
    'all', 'Discussion', 'Case Study', 'Research', 'Question'
  ];

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await supabase
          .from('posts')
          .delete()
          .eq('id', postId);
        
        setPosts(posts.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        let query = supabase
            .from('posts')
            .select(`
              id,
              title,
              content,
              raw_content,
              post_category,
              post_type,
              urgency_level,
              is_peer_reviewed,
              created_at,
              author:profiles!fk_author(name)
            `);

        if (filterCategory !== 'all') {
          query = query.eq('post_category', filterCategory);
        }

        if (filterType !== 'all') {
          query = query.eq('post_type', filterType);
        }

        if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'urgent') {
          query = query.order('urgency_level', { ascending: false });
        } else if (sortBy === 'peer-reviewed') {
          query = query.eq('is_peer_reviewed', true)
                     .order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [sortBy, filterCategory, filterType]);

  return (
    <div className="container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Medical Forum</h1>
        
        {user && (
          <Link
            to="/posts/new"
            className="btn btn-secondary-a"
          >
            Create New Post
          </Link>
        )}
      </div>

      {/* Enhanced Filter Card */}
      <div className="glass-panel p-6 mb-6 filter-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="filter-group">
            <div className="flex items-center gap-3 mb-2">
              <FaSortAmountDown className="text-primary-dark" />
              <label className="form-label filter-label">Sort By</label>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest Posts</option>
              <option value="urgent">Urgency Level</option>
              <option value="peer-reviewed">Peer Reviewed</option>
            </select>
          </div>

          <div className="filter-group">
            <div className="flex items-center gap-3 mb-2">
              <FaFilter className="text-primary-dark" />
              <label className="form-label filter-label">Category</label>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              {medicalCategories.map(category => (
                <option 
                  key={category} 
                  value={category}
                  className={`${category !== 'all' ? `category-${category.toLowerCase()}` : ''}`}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <div className="flex items-center gap-3 mb-2">
              <FaFileMedical className="text-primary-dark" />
              <label className="form-label filter-label">Post Type</label>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              {postTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="mt-4">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel p-8 text-center">
          <p className="mb-4">No posts found matching your filters.</p>
          <button 
            onClick={() => {
              setFilterCategory('all');
              setFilterType('all');
            }}
            className="btn btn-outline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;