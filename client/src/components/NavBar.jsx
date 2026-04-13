import { useAuth } from "../context/AuthContext";
import { signOut } from "../auth";
import { useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();
    const { dbUser } = useAuth();
    const handleSignOut = async () => {
        await signOut();
    };

  
  return (
    console.log(dbUser),
    <>
      <nav style={styles.navbar}>
        <img src="/Logo.png" alt="logo" style={styles.logo} />
        <div style={styles.userSection}>
          <img
            src={dbUser?.avatar_url}
            alt="avatar"
            style={styles.avatar}
          />
          <span style={styles.username}>
            {dbUser?.user_name}
          </span>
          {location.pathname !== "/admin" ? dbUser?.admin_role && (<a href="/admin" style={styles.button_admin}>Admin</a>) : <a href="/app" style={styles.button_admin}>App</a>}
          <button onClick={handleSignOut} style={styles.button}>
          Sign out
        </button>
        </div>
      </nav>
    </>
  );
}

export default NavBar;

const styles = {
  navbar: {
    width: "100vw",
    height: "40px",
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
    width: "auto",
    objectFit: "contain",
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "3px 10px",
    borderRadius: "999px",
    backgroundColor: "rgba(255,255,255,0.08)",
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
  },

  button: {
    backgroundColor: "#ef4444",
    border: "none",
    color: "white",
    padding: "3px 5px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
},

button_admin: {
    background: "linear-gradient(90deg, #47d1ff, #7253ff)",
    border: "none",
    color: "white",
    padding: "3px 5px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
}
};