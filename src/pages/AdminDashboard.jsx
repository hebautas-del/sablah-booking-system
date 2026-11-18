
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  // Get the logged-in admin's name from localStorage
  const name = localStorage.getItem("name");

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <p style={styles.subTitle}>PLATFORM ADMINISTRATION</p>

        <h1 style={styles.title}>Admin Dashboard</h1>

        <p style={styles.welcome}>
          Welcome back,{" "}
          <span style={{ color: "#b8860b" }}>
            {name || "Admin"}
          </span>
        </p>
      </div>

      {/* DASHBOARD CARDS */}
      <div style={styles.cardsContainer}>

        {/* USERS MANAGEMENT */}
        <div style={styles.card}>
          <div style={styles.icon}>👥</div>

          <h3 style={styles.cardTitle}>Users Management</h3>

          <p style={styles.cardText}>
            View and manage all registered users and owners.
          </p>

          <Link to="/admin-users">
            <button style={styles.button}>Open</button>
          </Link>
        </div>

        {/* SABLAH MANAGEMENT */}
        <div style={styles.card}>
          <div style={styles.icon}>🏠</div>

          <h3 style={styles.cardTitle}>Sablah Management</h3>

          <p style={styles.cardText}>
            View and manage all registered sablah listings.
          </p>

          <Link to="/admin-sablahs">
            <button style={styles.button}>Open</button>
          </Link>
        </div>

        {/* EDIT PROFILE */}
        <div style={styles.card}>
          <div style={styles.icon}>⚙️</div>

          <h3 style={styles.cardTitle}>Edit Profile</h3>

          <p style={styles.cardText}>
            Update your account information securely.
          </p>

          <Link to="/edit-profile">
            <button style={styles.button}>Edit</button>
          </Link>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// DASHBOARD STYLES
// ==========================================

const styles = {
  container: {
    padding: "40px",
    minHeight: "100vh",
    background: "#f8f5f1",
  },

  header: {
    textAlign: "center",
    marginBottom: "40px",
  },

  subTitle: {
    color: "#b8860b",
    fontSize: "13px",
    fontWeight: "bold",
    letterSpacing: "2px",
  },

  title: {
    color: "#333",
    fontSize: "32px",
    margin: "10px 0",
  },

  welcome: {
    color: "#666",
    fontSize: "16px",
  },

  cardsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    flexWrap: "wrap",
    gap: "25px",
  },

  card: {
    background: "white",
    width: "260px",
    padding: "30px 20px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  icon: {
    fontSize: "40px",
    marginBottom: "15px",
  },

  cardTitle: {
    color: "#333",
    fontSize: "20px",
    marginBottom: "12px",
  },

  cardText: {
    color: "#777",
    fontSize: "14px",
    lineHeight: "1.6",
    minHeight: "45px",
  },

  button: {
    background: "#b8860b",
    color: "white",
    border: "none",
    padding: "10px 25px",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "15px",
    fontSize: "14px",
  },
};
