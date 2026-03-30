import { supabase } from "../supabaseClient";

export const signInWithGoogle = async () => {
    return supabase.auth.signInWithOAuth({
        provider: 'google'
    });
};

export const signOut = async () => {
    return supabase.auth.signOut();
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