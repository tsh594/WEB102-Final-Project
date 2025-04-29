import { useState } from 'react';
import { supabase } from '../config/supabase';

const VoteButton = ({ commentId, user }) => {
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(null); // 'upvote' or 'downvote'
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = async (newDirection) => {
    if (loading) return;
    setLoading(true);

    try {
      // If the user is removing their upvote, we pass 'null' as the direction
      if (newDirection === null) {
        const { data, error } = await supabase.rpc('toggle_comment_vote', {
          user_uuid: user.id,
          comment_uuid: commentId,
          direction: 'remove_upvote'
        });
        if (error) throw error;

        setDirection(null); // Remove vote
      } else {
        // Handle upvoting or downvoting
        const { data, error } = await supabase.rpc('toggle_comment_vote', {
          user_uuid: user.id,
          comment_uuid: commentId,
          direction: newDirection
        });
        if (error) throw error;

        setDirection(newDirection); // Set the new direction
      }

      setHasVoted(true);
    } catch (err) {
      console.error('Error voting on comment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => handleVote('upvote')}
        disabled={loading || direction === 'upvote'}
      >
        Upvote
      </button>
      <button
        onClick={() => handleVote('downvote')}
        disabled={loading || direction === 'downvote'}
      >
        Downvote
      </button>
      <button
        onClick={() => handleVote(null)} // This is for removing the upvote
        disabled={loading || direction !== 'upvote'}
      >
        Remove Upvote
      </button>
    </div>
  );
};

export default VoteButton;
import { createClient } from '@supabase/supabase-js';

const validateEnv = () => {
  if (!import.meta.env.VITE_SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL environment variable is not set');
  }
  if (!import.meta.env.VITE_SUPABASE_KEY) {
    throw new Error('VITE_SUPABASE_KEY environment variable is not set');
  }
};

validateEnv();

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const defaultOptions = {
  auth: {
    storage: {
        getItem: async (key) => {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (key, value) => {
          localStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: async (key) => {
          localStorage.removeItem(key);
        }
      },
    //storage: window.localStorage, // or window.sessionStorage
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'medical-forum/v1.0',
    },
  },
  // Add storage configuration
  storage: {
    bucket: 'post-attachments',
    // Add custom headers if needed
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, defaultOptions);

/**
 * Health check function with storage verification
 */
export const checkSupabaseConnection = async () => {
  try {
    // Verify database connection
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
      
    if (postError) throw postError;

    // Verify storage connection
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('post-attachments')
      .list();

    if (storageError) throw storageError;

    return true;
  } catch (error) {
    console.error('Connection check failed:', error);
    return false;
  }
};

// Storage utility functions
export const storageService = {
  uploadFile: async (file, path) => {
    const { data, error } = await supabase.storage
      .from('post-attachments')
      .upload(path, file);

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    return supabase.storage
      .from('post-attachments')
      .getPublicUrl(data.path);
  },

  removeFile: async (path) => {
    const { error } = await supabase.storage
      .from('post-attachments')
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
};

// Initialize connection with storage verification
checkSupabaseConnection().then(connected => {
  if (connected) {
    console.log('Supabase connection established with storage');
  } else {
    console.error('Failed to establish connection with storage');
    // Implement fallback logic here if needed
  }
});

// Add this to your initialization code
async function clearSupabaseStorage() {
  try {
    await indexedDB.deleteDatabase('supabase');
    await indexedDB.deleteDatabase('supabase-auth-token');
    console.log('Supabase storage cleared');
  } catch (error) {
    console.log('Storage reset error:', error);
  }
}

// Run this when you detect storage errors
if (navigator.storage && navigator.storage.estimate) {
  navigator.storage.estimate().then(estimate => {
    if (estimate.usage / estimate.quota > 0.9) {
      clearSupabaseStorage();
    }
  });
}// src/context/PostsContext.jsx
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
};export const ensureProfileExists = async (user) => {
  if (!user) return;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!profile && !error) {
    const { error: createError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || 'Anonymous',
      });

    if (createError) {
      console.error('Profile creation error:', createError);
      throw createError;
    }
  }
};