export const ensureProfileExists = async (user) => {
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