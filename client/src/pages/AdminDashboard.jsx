import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const name = localStorage.getItem("name");

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <p style={styles.subTitle}>PLATFORM ADMINISTRATION</p>

        <h1 style={styles.title}>Admin Dashboard</h1>

        <p style={styles.welcome}>
          Welcome back, <span style={{ color: "#b8860b" }}>{name}</span>
        </p>
      </div>

      {/* CARDS */}
      <div style={styles.cardsContainer}>

        {/* USERS */}
        <div style={styles.card}>
          <div style={styles.icon}>👥</div>

          <h3 style={styles.cardTitle}>Users Management</h3>

          <p style={styles.cardText}>
            Manage all registered users and admins.
          </p>

          <Link to="/admin-users">
            <button style={styles.button}>Open</button>
          </Link>
        </div>

        {/* PROFILE */}
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

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f8f5f1",
    padding: "120px 60px"
  },

  header: {
    marginBottom: "50px"
  },

  subTitle: {
    color: "#b8860b",
    letterSpacing: "2px",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "10px"
  },

  title: {
    fontSize: "48px",
    color: "#1d1d1d",
    fontFamily: "serif",
    marginBottom: "10px"
  },

  welcome: {
    color: "#666",
    fontSize: "18px"
  },

  cardsContainer: {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap"
  },

  card: {
    width: "320px",
    background: "white",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
    border: "1px solid #eee",
    transition: "0.3s"
  },

  icon: {
    fontSize: "32px",
    marginBottom: "20px"
  },

  cardTitle: {
    fontSize: "24px",
    marginBottom: "12px",
    color: "#222"
  },

  cardText: {
    color: "#777",
    lineHeight: "1.6",
    marginBottom: "25px"
  },

  button: {
    background: "#b8860b",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600"
  }
};