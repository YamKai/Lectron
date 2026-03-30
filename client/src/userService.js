import { usersApi } from "./api/data/user";

export const syncUser = async (authUser) => {
  if (!authUser) return null;

  const userData = {
    user_id: authUser.id,
    email: authUser.email,
    user_name: authUser.user_metadata?.name || authUser.user?.user_metadata?.full_name || "Unknown",
    admin_role: false,
    avatar_url: authUser.user_metadata?.avatar_url || null,
  };

  try {
    const data = await usersApi.upsert(userData);
    return data;
  } catch (error) {
    console.error("User sync failed:", error);
    return null;
  }
};