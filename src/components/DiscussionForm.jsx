import { useState } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../auth/AuthContext';

const DiscussionForm = ({ mode, initialData, onSubmit }) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      content: '',
    }
  );
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'create') {
        const { data, error: insertError } = await supabase
          .from('discussions')
          .insert({
            title: formData.title,
            content: formData.content,
            user_id: user.id,
            upvotes: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        onSubmit(data);
      } else {
        const { error: updateError } = await supabase
          .from('discussions')
          .update({
            title: formData.title,
            content: formData.content,
          })
          .eq('id', initialData.id);

        if (updateError) throw updateError;
        onSubmit(formData);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">
        {mode === 'create' ? 'Create New Discussion' : 'Edit Discussion'}
      </h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="w-full px-3 py-2 border rounded"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="content">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            rows="6"
            className="w-full px-3 py-2 border rounded"
            value={formData.content}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {mode === 'create' ? 'Post Discussion' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiscussionForm;