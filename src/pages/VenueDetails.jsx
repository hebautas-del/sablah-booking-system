
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api";

export default function VenueDetails() {
  const { id } = useParams();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        setLoading(true);
        setError("");

        // Get the venue using its ID
        const response = await API.get("/sablahs");
        const foundVenue = response.data.find(
          (item) => item._id === id
        );

        if (!foundVenue) {
          setError("Sablah not found.");
          return;
        }

        setVenue(foundVenue);
      } catch (err) {
        console.error("Venue Details Error:", err);
        setError(
          err.response?.data?.message ||
          "Unable to load sablah details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [id]);

  const imagePath = venue?.images?.length
    ? venue.images[0]
    : venue?.image;

  const imageUrl = imagePath
    ? imagePath.startsWith("http")
      ? imagePath
      : `http://localhost:5000${imagePath}`
    : null;

  if (loading) {
    return <div style={styles.message}>Loading sablah details...</div>;
  }

  if (error || !venue) {
    return (
      <div style={styles.message}>
        <h2>{error || "Sablah not found."}</h2>
        <Link to="/venues" style={styles.backButton}>
          Back to Venues
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/venues" style={styles.back}>
          ← Back to All Venues
        </Link>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={venue.nameEn}
            style={styles.image}
          />
        ) : (
          <div style={styles.noImage}>No Image Available</div>
        )}

        <div style={styles.content}>
          <h1 style={styles.title}>{venue.nameEn}</h1>
          <h2 style={styles.arabicTitle}>{venue.nameAr}</h2>

          <p style={styles.location}>
            📍 {venue.area || venue.wilayat}, {venue.governorate}
          </p>

          <div style={styles.price}>
            OMR {Number(venue.price).toFixed(3)}
            <span style={styles.day}> / day</span>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <strong>Capacity</strong>
              <p>👥 {venue.capacity} guests</p>
            </div>

            <div style={styles.infoCard}>
              <strong>Wilayat</strong>
              <p>{venue.wilayat}</p>
            </div>
          </div>

          <h3 style={styles.heading}>About This Sablah</h3>
          <p style={styles.description}>
            {venue.descriptionEn || "No description available."}
          </p>

          {venue.descriptionAr && (
            <p style={styles.description} dir="rtl">
              {venue.descriptionAr}
            </p>
          )}

          <h3 style={styles.heading}>Facilities & Amenities</h3>

          {venue.amenities?.length > 0 ? (
            <div style={styles.amenities}>
              {venue.amenities.map((item, index) => (
                <span key={index} style={styles.amenity}>
                  ✓ {item}
                </span>
              ))}
            </div>
          ) : (
            <p>No facilities listed.</p>
          )}

          <h3 style={styles.heading}>Address</h3>
          <p style={styles.description}>{venue.address}</p>

          <Link to={`/book?sablah=${venue._id}`} style={styles.bookButton}>
            Book This Sablah
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8f5f1",
    padding: "110px 20px 70px"
  },
  container: {
    maxWidth: "1000px",
    margin: "auto",
    background: "white",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid #e8dfd2"
  },
  back: {
    display: "inline-block",
    margin: "25px",
    color: "#9a741e",
    textDecoration: "none",
    fontWeight: "600"
  },
  image: {
    width: "100%",
    height: "420px",
    objectFit: "cover",
    display: "block"
  },
  noImage: {
    height: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eee8df"
  },
  content: {
    padding: "35px"
  },
  title: {
    fontFamily: "serif",
    fontSize: "42px",
    color: "#222",
    marginBottom: "5px"
  },
  arabicTitle: {
    fontSize: "28px",
    color: "#9a741e",
    marginTop: "5px"
  },
  location: {
    color: "#777",
    fontSize: "16px"
  },
  price: {
    color: "#b8860b",
    fontSize: "32px",
    fontWeight: "bold",
    margin: "25px 0"
  },
  day: {
    color: "#777",
    fontSize: "16px",
    fontWeight: "normal"
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: "15px"
  },
  infoCard: {
    background: "#f8f5f1",
    padding: "20px",
    borderRadius: "12px"
  },
  heading: {
    marginTop: "30px",
    color: "#292929",
    fontSize: "22px"
  },
  description: {
    color: "#666",
    lineHeight: "1.8",
    whiteSpace: "pre-wrap"
  },
  amenities: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px"
  },
  amenity: {
    background: "#f8f5f1",
    padding: "12px 18px",
    borderRadius: "20px",
    color: "#70551c"
  },
  bookButton: {
    display: "inline-block",
    marginTop: "35px",
    padding: "15px 35px",
    background: "#b8860b",
    color: "white",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "bold"
  },
  message: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px"
  },
  backButton: {
    color: "#b8860b"
  }
};
