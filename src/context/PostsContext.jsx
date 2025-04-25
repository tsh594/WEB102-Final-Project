// src/context/PostsContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

export const PostsContext = createContext();

export const PostsProvider = ({ children }) => {
  const [postsCache, setPostsCache] = useState({});

  const updatePostVotes = useCallback((postId, votes, userVoted) => {
    setPostsCache(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        votes,
        userVoted,
        lastUpdated: Date.now()
      }
    }));
  }, []); // Stable function reference

  return (
    <PostsContext.Provider value={{ postsCache, updatePostVotes }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};