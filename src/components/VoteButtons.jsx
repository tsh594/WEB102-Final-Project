import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../config/supabase';

const VoteButtons = ({ discussionId, initialUpvotes }) => {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [userVote, setUserVote] = useState(null);

  const handleVote = async (direction) => {
    if (!user) return;

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select()
        .eq('discussion_id', discussionId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        // User already voted - update or remove vote
        if (existingVote.direction === direction) {
          // Remove vote
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id);

          setUpvotes(prev => prev + (direction === 'up' ? -1 : 1));
          setUserVote(null);
        } else {
          // Change vote direction
          await supabase
            .from('votes')
            .update({ direction })
            .eq('id', existingVote.id);

          setUpvotes(prev => prev + (direction === 'up' ? 2 : -2));
          setUserVote(direction);
        }
      } else {
        // New vote
        await supabase
          .from('votes')
          .insert({
            discussion_id: discussionId,
            user_id: user.id,
            direction,
          });

        setUpvotes(prev => prev + (direction === 'up' ? 1 : -1));
        setUserVote(direction);
      }

      // Update discussion upvotes count
      await supabase
        .from('discussions')
        .update({ upvotes })
        .eq('id', discussionId);
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  return (
    <div className="flex flex-col items-center ml-4">
      <button
        onClick={() => handleVote('up')}
        disabled={!user}
        className={`p-2 rounded-t-full ${userVote === 'up' ? 'text-blue-600' : 'text-gray-400'} ${user ? 'hover:bg-gray-100' : ''}`}
      >
        ▲
      </button>
      <span className="my-1 font-medium">{upvotes}</span>
      <button
        onClick={() => handleVote('down')}
        disabled={!user}
        className={`p-2 rounded-b-full ${userVote === 'down' ? 'text-red-600' : 'text-gray-400'} ${user ? 'hover:bg-gray-100' : ''}`}
      >
        ▼
      </button>
    </div>
  );
};

export default VoteButtons;