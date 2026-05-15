import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const name = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav style={styles.navbar}>

      {/* LEFT LOGO */}
      <div style={styles.logo} onClick={() => navigate("/")}>
        SABLAH
      </div>

      {/* CENTER LINKS */}
      <div style={styles.links}>
        <Link to="/home" style={styles.link}>Home</Link>
        <Link to="/search" style={styles.link}>Search</Link>
        <Link to="/venues" style={styles.link}>Venues</Link>
        <Link to="/book" style={styles.link}>Book</Link>
        <Link to="/become-host" style={styles.link}>Host</Link>
        <Link to="/my-bookings" style={styles.link}>Bookings</Link>
      </div>

      {/* RIGHT SECTION FIXED */}
      <div style={styles.right}>

        <span style={styles.lang}>EN | AR</span>

        {name ? (
          <>
            <span style={styles.user}>Hi, {name}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            style={styles.loginBtn}
          >
            Login
          </button>
        )}

      </div>

    </nav>
  );
}

const styles = {
  navbar: {
    height: "70px",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 25px",
    background: "#fff",
    borderBottom: "1px solid #eee",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 999,

    /* 🔥 IMPORTANT FIX */
    boxSizing: "border-box",
    overflow: "visible"
  },

  logo: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#b8860b",
    cursor: "pointer",
    flexShrink: 0
  },

  links: {
    display: "flex",
    gap: "18px",
    flex: 1,
    justifyContent: "center",
    minWidth: 0
  },

  link: {
    textDecoration: "none",
    color: "#333",
    fontSize: "14px",
    fontWeight: "500",
    whiteSpace: "nowrap"
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0   // 🔥 FIX: prevents button being cut
  },

  lang: {
    fontSize: "13px",
    color: "#777",
    whiteSpace: "nowrap"
  },

  user: {
    fontSize: "14px",
    color: "#b8860b",
    fontWeight: "600",
    whiteSpace: "nowrap"
  },

  loginBtn: {
    background: "#b8860b",
    border: "none",
    color: "white",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    whiteSpace: "nowrap"
  },

  logoutBtn: {
    background: "transparent",
    border: "1px solid #b8860b",
    color: "#b8860b",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    whiteSpace: "nowrap"
  }
};