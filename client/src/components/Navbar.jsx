import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  const navigate = useNavigate();

  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav style={styles.navbar}>

      {/* LEFT LOGO */}
      <div
  style={styles.logoContainer}
  onClick={() => navigate("/home")}   // ✅ THIS IS THE ONLY ADDITION
>

  <div style={styles.logoBox}>
    <img
      src={logo}
      alt="logo"
      style={styles.logoImg}
    />
  </div>

  <div>
    <div style={styles.logo}>Sablah</div>
    <div style={styles.subLogo}>SABLAH BOOKING</div>
  </div>

</div>
      {/* CENTER LINKS */}
      <div style={styles.links}>
        <Link to="/home" style={styles.link}>Home</Link>

        <Link to="/search" style={styles.link}>
          Search
        </Link>

        <Link to="/venues" style={styles.link}>
          View Venues
        </Link>

        <Link to="/book" style={styles.link}>
          Book
        </Link>

        <Link to="/become-host" style={styles.link}>
          Become a Host
        </Link>

        {/* ADMIN ONLY */}
        {role === "admin" && (
          <Link to="/admin-dashboard" style={styles.adminLink}>
            Admin
          </Link>
        )}

        {/* OWNER ONLY */}
        {role === "owner" && (
          <Link to="/owner-dashboard" style={styles.adminLink}>
            Owner Dashboard
          </Link>
        )}


        <Link to="/edit-profile" style={styles.link}>
        Edit Profile
        </Link>
      </div>

      {/* RIGHT SECTION */}
      <div style={styles.right}>

        <span style={styles.icon}>⚖</span>
        <span style={styles.currency}>﷼</span>
        <span style={styles.icon}>◔</span>

        {name ? (
          <>
            <button
              onClick={() => navigate("/edit-profile")}
              style={styles.platformBtn}
            >
              🛡 {name}
            </button>

            <button
              onClick={handleLogout}
              style={styles.logoutBtn}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            style={styles.loginBtn}
          >
            Platform
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
    background: "#f8f5f1",
    borderBottom: "1px solid #e7dfd4",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 999,
    boxSizing: "border-box"
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    flexShrink: 0
  },

logoBox: {
  width: "42px",
  height: "42px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden"
},

  logo: {
    fontSize: "28px",
    fontWeight: "500",
    color: "#b8860b",
    fontFamily: "serif",
    lineHeight: "24px"
  },
logoImg: {
  width: "30px",
  height: "30px",
  objectFit: "contain"
},
  subLogo: {
    fontSize: "10px",
    letterSpacing: "2px",
    color: "#777",
    marginTop: "3px"
  },

  links: {
    display: "flex",
    gap: "28px",
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },

  link: {
    textDecoration: "none",
    color: "#5f5a54",
    fontSize: "15px",
    fontWeight: "500",
    transition: "0.3s"
  },

  adminLink: {
    textDecoration: "none",
    color: "#b8860b",
    fontSize: "15px",
    fontWeight: "600"
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexShrink: 0
  },

  icon: {
    fontSize: "15px",
    color: "#333",
    cursor: "pointer"
  },

  currency: {
    fontSize: "16px",
    color: "#333"
  },

  platformBtn: {
    background: "transparent",
    border: "1px solid #d7c6a5",
    color: "#333",
    padding: "8px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "13px"
  },

  loginBtn: {
    background: "transparent",
    border: "1px solid #d7c6a5",
    color: "#333",
    padding: "8px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "13px"
  },

  logoutBtn: {
    background: "#b8860b",
    border: "none",
    color: "white",
    padding: "8px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px"
  }
};