import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../config/supabase';
import Avatar from '../components/Avatar';
import AvatarUpload from '../components/AvatarUpload';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontSettings, setFontSettings] = useState({
    family: 'Inter',
    size: 16,
    color: '#1e293b',
    bold: false
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error) {
        setProfile(data);
        if (data.font_settings) {
          setFontSettings(data.font_settings);
        }
      }
      setLoading(false);
    };

    if (user) fetchProfile();
  }, [user]);

  useEffect(() => {
    if (profile?.font_settings) {
      document.documentElement.style.setProperty('--font-family', fontSettings.family);
      document.documentElement.style.setProperty('--font-size', `${fontSettings.size}px`);
      document.documentElement.style.setProperty('--font-color', fontSettings.color);
      document.documentElement.style.setProperty('--font-weight', fontSettings.bold ? '600' : '400');
    }
  }, [fontSettings, profile]);

  const updateProfile = async (updates) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) setProfile(prev => ({ ...prev, ...updates }));
    return !error;
  };

  const handleFontChange = async (newSettings) => {
    const updatedSettings = { ...fontSettings, ...newSettings };
    setFontSettings(updatedSettings);
    await updateProfile({ font_settings: updatedSettings });
  };

  if (loading) return <div className="text-center py-8">Loading profile...</div>;

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="glass-panel p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        <div className="flex items-center gap-6 mb-8">
          <Avatar user={user} size="lg" />
          <AvatarUpload 
            user={user} 
            onUpload={async (url) => {
              await updateProfile({ avatar_url: url });
              await supabase.auth.updateUser({
                data: { avatar_url: url }
              });
            }}
          />
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={profile?.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="form-input w-full"
            />
          </div>
          
          <div className="glass-panel p-4">
            <h2 className="text-xl font-bold mb-4">Display Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Font Family</label>
                <select
                  value={fontSettings.family}
                  onChange={(e) => handleFontChange({ family: e.target.value })}
                  className="form-input w-full"
                >
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Monospace">Monospace</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-2">Font Size ({fontSettings.size}px)</label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSettings.size}
                  onChange={(e) => handleFontChange({ size: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">Text Color</label>
                <input
                  type="color"
                  value={fontSettings.color}
                  onChange={(e) => handleFontChange({ color: e.target.value })}
                  className="w-full h-10 cursor-pointer"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={fontSettings.bold}
                  onChange={(e) => handleFontChange({ bold: e.target.checked })}
                  className="form-checkbox h-4 w-4"
                />
                <label className="text-sm">Bold Text</label>
              </div>
            </div>
          </div>

          <button
            onClick={() => updateProfile({ name: profile.name })}
            className="btn btn-primary w-full"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;