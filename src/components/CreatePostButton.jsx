const CreatePostButton = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    console.log('Current user:', user); // Check if user exists
    navigate('/posts/new');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <button onClick={handleClick}>
      {user ? 'Create Post' : 'Login to Create Post'}
    </button>
  );
};