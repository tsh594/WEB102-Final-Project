import { Link } from 'react-router-dom';
import VoteButtons from './VoteButtons';

const DiscussionItem = ({ discussion }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between">
        <div>
          <Link to={`/discussions/${discussion.id}`} className="block">
            <h2 className="text-xl font-semibold text-blue-600 hover:underline">
              {discussion.title}
            </h2>
          </Link>
          <p className="text-gray-600 mt-1 line-clamp-2">{discussion.content}</p>
        </div>
        <VoteButtons discussionId={discussion.id} initialUpvotes={discussion.upvotes} />
      </div>
      <div className="mt-4 flex justify-between text-sm text-gray-500">
        <span>Posted by {discussion.user?.name || 'Anonymous'}</span>
        <span>
          {new Date(discussion.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default DiscussionItem;