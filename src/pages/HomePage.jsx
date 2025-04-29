import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../config/supabase';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { FaSortAmountDown, FaFilter, FaFileMedical, FaSearch } from 'react-icons/fa';
import '../index.css';

const medicalSpecialties = [
  { name: 'General Medicine', color: '#4CAF50', icon: '🩺' },
  { name: 'Radiology', color: '#9C27B0', icon: '📷' },
  { name: 'Cardiology', color: '#F44336', icon: '❤️' },
  { name: 'Neurology', color: '#3F51B5', icon: '🧠' },
  { name: 'Oncology', color: '#FF5722', icon: '🦠' },
  { name: 'Pediatrics', color: '#FFC107', icon: '👶' },
  { name: 'Orthopedics', color: '#795548', icon: '🦴' },
  { name: 'Dermatology', color: '#FF9800', icon: '👩⚕️' },
  { name: 'Gastroenterology', color: '#8BC34A', icon: '🍏' },
  { name: 'Endocrinology', color: '#E91E63', icon: '⚖️' },
  { name: 'Pulmonology', color: '#00BCD4', icon: '🌬️' },
  { name: 'Nephrology', color: '#673AB7', icon: '💧' },
  { name: 'Hematology', color: '#F44336', icon: '🩸' },
  { name: 'Rheumatology', color: '#FF7043', icon: '🦵' },
  { name: 'Infectious Diseases', color: '#CDDC39', icon: '🦠' },
  { name: 'Emergency Medicine', color: '#F44336', icon: '🚑' },
  { name: 'Family Medicine', color: '#4CAF50', icon: '👪' },
  { name: 'Psychiatry', color: '#9C27B0', icon: '🧠' },
  { name: 'Obstetrics/Gynecology', color: '#E91E63', icon: '🤰' },
  { name: 'Urology', color: '#3F51B5', icon: '🚹' },
  { name: 'Ophthalmology', color: '#00BCD4', icon: '👁️' },
  { name: 'Otolaryngology', color: '#795548', icon: '👂' },
  { name: 'Anesthesiology', color: '#607D8B', icon: '💉' },
  { name: 'Pathology', color: '#9E9E9E', icon: '🔬' }
];

const HomePage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const timeoutRef = useRef();

  const medicalCategories = ['all', ...medicalSpecialties.map(s => s.name)];
  const postTypes = ['all', 'Discussion', 'Case Study', 'Research', 'Question'];

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
            id, title, content, raw_content, post_category, post_type,
            urgency_level, is_peer_reviewed, created_at, attachments,
            author:profiles!fk_author(name), votes:post_votes!fk_post_id(direction)
          `);

        if (filterCategory !== 'all') query = query.eq('post_category', filterCategory);
        if (filterType !== 'all') query = query.eq('post_type', filterType);

        const { data, error } = await query;
        if (error) throw error;

        let processed = data.map(post => ({
          ...post,
          upvotes: post.votes.filter(v => v.direction === 1).length,
          image_url: post.attachments?.[0]?.url || null,
          attachments: post.attachments || []
        }));

        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const searchTerms = q.split(/\s+/);
          
          processed = processed.filter(p => {
            const title = p.title?.toLowerCase() || '';
            const content = p.raw_content?.toLowerCase() || '';
            const category = p.post_category?.toLowerCase() || '';
            const author = p.author?.name?.toLowerCase() || '';

            return searchTerms.every(term =>
              title.includes(term) ||
              content.includes(term) ||
              category.includes(term) ||
              author.includes(term)
            );
          });
        }

        let sorted = [...processed];
        switch (sortBy) {
          case 'newest':
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
          case 'urgent':
            sorted.sort((a, b) => b.urgency_level - a.urgency_level);
            break;
          case 'peer-reviewed':
            sorted = sorted
              .filter(p => p.is_peer_reviewed)
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
          case 'upvotes':
            sorted.sort((a, b) => b.upvotes - a.upvotes || new Date(b.created_at) - new Date(a.created_at));
            break;
          default:
            break;
        }

        setPosts(sorted);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [sortBy, filterCategory, filterType, searchQuery]);

  return (
    <div className="container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Medical Forum</h1>
        {user && (
          <Link to="/posts/new" className="btn btn-secondary-a">
            Create New Post
          </Link>
        )}
      </div>

      <div className="glass-panel p-6 mb-6 filter-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="filter-group-a">
            <div className="flex items-center gap-3 mb-2">
              <FaSearch className="text-primary-dark" />
              <label className="form-label filter-label">Search</label>
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => {
                  setSearchQuery(e.target.value);
                }, 300);
              }}
              placeholder="Search by title, content, category, or author..."
              className="filter-select"
            />
          </div>

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
              <option value="upvotes">Most Upvoted</option>
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
              {medicalCategories.map((cat) => {
                const specialty = medicalSpecialties.find((s) => s.name === cat);
                return (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : `${specialty?.icon} ${cat}`}
                  </option>
                );
              })}
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
              {postTypes.map((type) => (
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
              setSearchQuery('');
              setInputValue('');
            }}
            className="btn btn-outline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => {
            const specialty = medicalSpecialties.find(
              (s) => s.name === post.post_category
            );
            
            return (
              <PostCard
                key={post.id}
                post={{ 
                  ...post,
                  categoryIcon: specialty?.icon || '📄',
                  categoryColor: specialty?.color || '#666',
                  id: post.id,
                  title: post.title,
                  raw_content: post.raw_content,
                  post_category: post.post_category,
                  post_type: post.post_type,
                  urgency_level: post.urgency_level,
                  is_peer_reviewed: post.is_peer_reviewed,
                  created_at: post.created_at,
                  author: post.author,
                  votes: post.upvotes,
                  attachments: post.attachments,
                  image_url: post.attachments?.[0]?.url || null
                }}
                onDelete={handleDeletePost}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HomePage;