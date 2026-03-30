import { supabase } from "../supabaseClient";

export const signInWithGoogle = async () => {
    return supabase.auth.signInWithOAuth({
        provider: 'google'
    });
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;

  await supabase.auth.getSession();
};

export const getCurrentUser = () => {
    const { data } = supabase.auth.getUser();
    return data.user;
};

export const getSession = () => {
    const { data } = supabase.auth.getSession();
    return data.session;
};

export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user || null);
    });
};