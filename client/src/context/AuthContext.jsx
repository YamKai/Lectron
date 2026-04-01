import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChange } from "../auth";
import { syncUser } from "../userService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: listener } = onAuthStateChange(async (user) => {
      setAuthUser(user);

      if (user) {
        const dbUser = await syncUser(user);
        setDbUser(dbUser);
      } else {
        setDbUser(null);
      }

      setLoading(false);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, dbUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);