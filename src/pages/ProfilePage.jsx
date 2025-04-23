import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../config/supabase';
import Avatar from '../components/Avatar';
import AvatarUpload from '../components/AvatarUpload';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) console.error(error);
      else setProfile(data);
      
      setLoading(false);
    };

    if (user) fetchProfile();
  }, [user]);

  const updateProfile = async (updates) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Update error:', error);
      return false;
    }
    return true;
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="glass-panel p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        <div className="flex items-center gap-6 mb-6">
          <Avatar user={user} size={16} />
          <AvatarUpload 
            user={user} 
            onUpload={(url) => {
              updateProfile({ avatar_url: url });
              setProfile({ ...profile, avatar_url: url });
            }}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={profile?.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="form-input w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="form-input w-full bg-gray-100"
            />
          </div>

          <button
            onClick={() => updateProfile({ name: profile.name })}
            className="btn btn-primary mt-4"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;