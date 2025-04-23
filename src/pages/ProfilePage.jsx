import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../config/supabase';
import Avatar from '../components/Avatar';
import AvatarUpload from '../components/AvatarUpload';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ 
    name: '', 
    avatar_url: '', 
    font_settings: {} 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fontSettings, setFontSettings] = useState({
    family: 'Inter',
    size: 16,
    color: '#1e293b',
    weight: 400,
    style: 'normal'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        setProfile(data);
        if (data.font_settings) {
          setFontSettings({
            family: data.font_settings.family || 'Inter',
            size: data.font_settings.size || 16,
            color: data.font_settings.color || '#1e293b',
            weight: data.font_settings.weight || 400,
            style: data.font_settings.style || 'normal'
          });
        }
      } catch (err) {
        setError('Failed to load profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  useEffect(() => {
    const applyFontSettings = () => {
      document.documentElement.style.setProperty('--font-family', fontSettings.family);
      document.documentElement.style.setProperty('--font-size', `${fontSettings.size}px`);
      document.documentElement.style.setProperty('--font-color', fontSettings.color);
      document.documentElement.style.setProperty('--font-weight', fontSettings.weight);
      document.documentElement.style.setProperty('--font-style', fontSettings.style);
    };

    applyFontSettings();
  }, [fontSettings]);

  const updateProfile = async (updates) => {
    setError('');
    setSuccess('');
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => ({ ...prev, ...updates }));
      setSuccess('Profile updated successfully!');
      return true;
    } catch (err) {
      setError('Update failed: ' + err.message);
      return false;
    }
  };

  const handleFontChange = async (newSettings) => {
    const updatedSettings = { 
      ...fontSettings, 
      ...newSettings,
      weight: newSettings.weight ? Number(newSettings.weight) : fontSettings.weight
    };
    setFontSettings(updatedSettings);
    await updateProfile({ font_settings: updatedSettings });
  };

  const handleSaveName = async () => {
    if (!profile.name.trim()) {
      setError('Display name cannot be empty');
      return;
    }
    await updateProfile({ name: profile.name.trim() });
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="glass-panel p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        {error && <div className="error-banner mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4">{success}</div>}

        <div className="flex items-center gap-6 mb-8">
          <Avatar user={user} size="lg" />
          <AvatarUpload 
            user={user} 
            onUpload={async (url) => {
              const success = await updateProfile({ avatar_url: url });
              if (success) {
                await supabase.auth.updateUser({
                  data: { avatar_url: url }
                });
              }
            }}
          />
        </div>

        <div className="space-y-6">
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
              className="form-control"
              placeholder="Enter your display name"
            />
          </div>
          
          <div className="glass-panel p-4">
            <h2 className="text-xl font-bold mb-4">Display Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Font Family</label>
                <select
                  value={fontSettings.family}
                  onChange={(e) => handleFontChange({ family: e.target.value })}
                  className="form-control"
                >
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Font Size ({fontSettings.size}px)
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSettings.size}
                  onChange={(e) => handleFontChange({ size: parseInt(e.target.value) })}
                  className="form-range"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Text Color</label>
                <input
                  type="color"
                  value={fontSettings.color}
                  onChange={(e) => handleFontChange({ color: e.target.value })}
                  className="w-full h-10 cursor-pointer"
                />
              </div>
              
              <div className="form-group flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={fontSettings.weight === 700}
                    onChange={(e) => handleFontChange({ 
                      weight: e.target.checked ? 700 : 400 
                    })}
                    className="form-checkbox"
                  />
                  <label className="form-label mb-0">Bold</label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={fontSettings.style === 'italic'}
                    onChange={(e) => handleFontChange({ 
                      style: e.target.checked ? 'italic' : 'normal'
                    })}
                    className="form-checkbox"
                  />
                  <label className="form-label mb-0">Italic</label>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveName}
            className="btn btn-primary w-full"
            disabled={!profile.name.trim()}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;