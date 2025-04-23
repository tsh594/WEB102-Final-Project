import { useState, useEffect } from 'react';
import DiscussionItem from './DiscussionItem';
import { supabase } from '../config/supabase';

const DiscussionList = ({ sortBy }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        let query = supabase
          .from('discussions')
          .select(`
            id,
            title,
            content,
            created_at,
            upvotes,
            user:profiles(name)
          `);

        if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else {
          query = query.order('upvotes', { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;

        setDiscussions(data);
      } catch (err) {
        console.error('Error fetching discussions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [sortBy]);

  if (loading) return <div className="text-center py-8">Loading discussions...</div>;

  if (discussions.length === 0) {
    return <div className="text-center py-8">No discussions found</div>;
  }

  return (
    <div className="space-y-4">
      {discussions.map((discussion) => (
        <DiscussionItem key={discussion.id} discussion={discussion} />
      ))}
    </div>
  );
};

export default DiscussionList;