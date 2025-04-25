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
