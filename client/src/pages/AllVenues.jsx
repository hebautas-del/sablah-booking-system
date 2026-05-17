import { Link } from "react-router-dom";

// ✅ PNG IMAGES IMPORT
import bustan from "../assets/bustan.png";
import modern from "../assets/modern.png";
import muttrah from "../assets/muttrah.png";
import seeb from "../assets/seeb.png";

export default function AllVenues() {
  const venues = [
    {
      id: 1,
      name: "Al Bustan Royal Sablah",
      area: "Qurum",
      guests: 400,
      price: 850,
      rating: 4.9,
      reviews: 184,
      image: bustan
    },
    {
      id: 2,
      name: "Al Khuwair Modern Majlis",
      area: "Al Khuwair",
      guests: 120,
      price: 320,
      rating: 4.7,
      reviews: 96,
      image: modern
    },
    {
      id: 3,
      name: "Muttrah Heritage Sablah",
      area: "Muttrah",
      guests: 200,
      price: 550,
      rating: 4.8,
      reviews: 142,
      image: muttrah
    },
    {
      id: 4,
      name: "Seeb Garden Sablah",
      area: "Seeb",
      guests: 600,
      price: 1200,
      rating: 5,
      reviews: 211,
      image: seeb
    }
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <h1 style={styles.title}>All Venues</h1>

        <p style={styles.subtitle}>
          {venues.length} available sablahs
        </p>

        {/* CARDS */}
        <div style={styles.grid}>
          {venues.map((venue) => (
            <div key={venue.id} style={styles.card}>

              {/* IMAGE */}
              <div style={styles.imageContainer}>
                <img
                  src={venue.image}
                  alt={venue.name}
                  style={styles.image}
                />

                <div style={styles.featured}>
                  ⭐ Featured
                </div>

                <div style={styles.rating}>
                  ⭐ {venue.rating} ({venue.reviews})
                </div>
              </div>

              {/* CONTENT */}
              <div style={styles.content}>
                <h2 style={styles.name}>{venue.name}</h2>

                <div style={styles.info}>
                  📍 {venue.area}
                  <span style={{ marginLeft: "14px" }}>
                    👥 {venue.guests}
                  </span>
                </div>

                <div style={styles.line}></div>

                <div style={styles.bottom}>
                  <div>
                    <span style={styles.price}>OMR {venue.price}</span>
                    <span style={styles.day}> / day</span>
                  </div>

                  <Link
                    to={`/venue/${venue.id}`}
                    style={styles.viewBtn}
                  >
                    View →
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8f5f1",
    paddingTop: "100px",
    paddingBottom: "80px"
  },

  container: {
    width: "95%",
    margin: "auto"
  },

  title: {
    fontSize: "56px",
    fontFamily: "serif",
    color: "#1f1f1f",
    marginBottom: "10px"
  },

  subtitle: {
    color: "#666",
    fontSize: "28px",
    marginBottom: "40px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: "30px"
  },

  card: {
    background: "white",
    borderRadius: "22px",
    overflow: "hidden",
    border: "1px solid #e8dfd2",
    transition: "0.3s"
  },

  imageContainer: {
    position: "relative"
  },

  image: {
    width: "100%",
    height: "240px",
    objectFit: "cover"
  },

  featured: {
    position: "absolute",
    top: "14px",
    left: "14px",
    background: "#d4a63d",
    color: "white",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600"
  },

  rating: {
    position: "absolute",
    bottom: "14px",
    right: "14px",
    background: "rgba(255,255,255,0.95)",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#444"
  },

  content: {
    padding: "20px"
  },

  name: {
    fontSize: "34px",
    fontFamily: "serif",
    color: "#222",
    lineHeight: "1.3",
    marginBottom: "14px"
  },

  info: {
    color: "#777",
    fontSize: "15px",
    marginBottom: "18px"
  },

  line: {
    borderBottom: "1px solid #eee",
    marginBottom: "18px"
  },

  bottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  price: {
    color: "#d4a63d",
    fontSize: "42px",
    fontFamily: "serif",
    fontWeight: "500"
  },

  day: {
    color: "#777",
    fontSize: "16px"
  },

  viewBtn: {
    color: "#b8860b",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "15px"
  }
};