
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function AllVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/sablahs");
        setVenues(response.data);
      } catch (err) {
        console.error("Fetch Sablahs Error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load venues. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <h1 style={styles.title}>All Venues</h1>

        <p style={styles.subtitle}>
          {loading
            ? "Loading venues..."
            : `${venues.length} available sablahs`}
        </p>

        {/* LOADING */}
        {loading && (
          <p style={styles.message}>Loading sablahs...</p>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div style={styles.error}>
            <p>{error}</p>
            <button
              style={styles.retryBtn}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && venues.length === 0 && (
          <p style={styles.message}>
            No sablahs are available at the moment.
          </p>
        )}

        {/* VENUE CARDS */}
        {!loading && !error && venues.length > 0 && (
          <div style={styles.grid}>
            {venues.map((venue) => {
              const imagePath =
                venue.images?.length > 0
                  ? venue.images[0]
                  : venue.image;

              const imageUrl = imagePath
                ? imagePath.startsWith("http")
                  ? imagePath
                  : `http://localhost:5000${imagePath}`
                : null;

              return (
                <div key={venue._id} style={styles.card}>

                  {/* IMAGE */}
                  <div style={styles.imageContainer}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={venue.nameEn}
                        style={styles.image}
                      />
                    ) : (
                      <div style={styles.noImage}>
                        No Image Available
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div style={styles.content}>
                    <h2 style={styles.name}>
                      {venue.nameEn}
                    </h2>

                    <div style={styles.info}>
                      📍 {venue.area || venue.wilayat || venue.governorate}

                      <span style={{ marginLeft: "14px" }}>
                        👥 {venue.capacity} guests
                      </span>
                    </div>

                    <div style={styles.line}></div>

                    <div style={styles.bottom}>
                      <div>
                        <span style={styles.price}>
                          OMR {venue.price}
                        </span>
                        <span style={styles.day}> / day</span>
                      </div>

                      <Link
                        to={`/venue/${venue._id}`}
                        style={styles.viewBtn}
                      >
                        View →
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

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

  noImage: {
    height: "240px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eee8df",
    color: "#777"
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
  },

  message: {
    color: "#666",
    fontSize: "18px",
    textAlign: "center",
    padding: "50px 10px"
  },

  error: {
    textAlign: "center",
    color: "#b42318",
    padding: "30px"
  },

  retryBtn: {
    padding: "10px 22px",
    border: "none",
    borderRadius: "8px",
    background: "#b8860b",
    color: "white",
    cursor: "pointer"
  }
};
