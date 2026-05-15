import { useNavigate } from "react-router-dom";
import hero from "../assets/hero.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>

      {/* HERO SECTION */}
      <div style={styles.hero}>
        <div style={styles.overlay}></div>

        <div style={styles.content}>
          <h1 style={styles.title}>Sablah</h1>

          <p style={styles.subtitle}>
            Discover and book traditional Majlis & Sablah venues in Oman
          </p>

          <button
            style={styles.button}
            onClick={() => navigate("/login")}
          >
            Start Booking
          </button>
        </div>
      </div>

    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Arial",
    margin: 0,
    padding: 0
  },

  hero: {
    height: "100vh",
    width: "100%",
    backgroundImage: `url(${hero})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative"
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)"
  },

  content: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    color: "white",
    maxWidth: "600px"
  },

  title: {
    fontSize: "60px",
    marginBottom: "10px"
  },

  subtitle: {
    fontSize: "18px",
    marginBottom: "20px"
  },

  button: {
    padding: "12px 25px",
    background: "#b8860b",
    border: "none",
    color: "white",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "16px"
  }
};