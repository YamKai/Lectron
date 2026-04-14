import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { signOut } from "../auth";
import { useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();
  const { dbUser } = useAuth();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const handleSignOut = async () => {
    await signOut();
  };

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav style={styles.navbar}>
      <img src="/Logo.png" alt="logo" style={styles.logo} />

      <div style={styles.userWrapper} ref={dropdownRef}>
        <div
          style={styles.userSection}
          onClick={() => setOpen((prev) => !prev)}
        >
          <img src={dbUser?.avatar_url} alt="avatar" style={styles.avatar} />
          <span style={styles.username}>{dbUser?.user_name}</span>
        </div>

        {open && (
          <div style={styles.dropdown}>
            {location.pathname !== "/admin"
              ? dbUser?.admin_role && (
                  <a href="/admin" style={styles.button_admin}>
                    Admin
                  </a>
                )
              : (
                  <a href="/app" style={styles.button_admin}>
                    App
                  </a>
                )}

            <button onClick={handleSignOut} style={styles.button}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;

const styles = {
  navbar: {
    width: "100vw",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 30px",
    backgroundColor: "#10111A",
    color: "white",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    boxSizing: "border-box",
    borderRadius: "0 0 15px 15px",
  },

  logo: {
    height: "36px",
    objectFit: "contain",
  },

  userWrapper: {
    position: "relative",
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "5px 8px",
    borderRadius: "999px",
    backgroundColor: "rgba(255,255,255,0.08)",
    cursor: "pointer",
  },

  avatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid rgba(255,255,255,0.2)",
  },

  username: {
    fontSize: "14px",
    fontWeight: "500",
    paddingRight: "8px",
  },

  dropdown: {
    position: "absolute",
    top: "55px",
    right: 0,
    backgroundColor: "#1a1b23",
    borderRadius: "10px",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    minWidth: "140px",
  },

  button: {
    backgroundColor: "#ef4444",
    border: "none",
    color: "white",
    padding: "6px 8px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    width: "100%",
  },

  button_admin: {
    background: "linear-gradient(90deg, #47d1ff, #7253ff)",
    border: "none",
    color: "white",
    padding: "6px 8px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    textDecoration: "none",
    textAlign: "center",
    display: "block",
    width: "89%",
  },
};