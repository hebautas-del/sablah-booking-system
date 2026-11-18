
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../api";

export default function Book() {
  const [searchParams] = useSearchParams();

  const sablahId = searchParams.get("sablah");

  const [venue, setVenue] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [guests, setGuests] = useState("1");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  // Load selected Sablah
  useEffect(() => {
    const fetchVenue = async () => {
      try {
        if (!sablahId) {
          setError("Please select a sablah before booking.");
          return;
        }

        const response = await API.get("/sablahs");

        const selectedVenue = response.data.find(
          (item) => item._id === sablahId
        );

        if (!selectedVenue) {
          setError("Selected sablah was not found.");
          return;
        }

        setVenue(selectedVenue);
      } catch (err) {
        console.error("Fetch Booking Venue Error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load sablah information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [sablahId]);

  // Get today's date in local time
  const today = (() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  })();

  // Submit booking
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!venue) {
      setError("Sablah information is not available.");
      return;
    }

    if (!bookingDate) {
      setError("Please select a booking date.");
      return;
    }

    const guestCount = Number(guests);

    if (
      !Number.isInteger(guestCount) ||
      guestCount < 1 ||
      guestCount > venue.capacity
    ) {
      setError(
        `Number of guests must be between 1 and ${venue.capacity}.`
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await API.post("/bookings", {
        sablahId,
        bookingDate,
        guests: guestCount,
        notes
      });

      setSuccess(
        response.data?.message ||
        "Your booking request has been submitted successfully."
      );

      setBookingSubmitted(true);

    } catch (err) {
      console.error("Create Booking Error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to submit booking. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.message}>
        Loading booking details...
      </div>
    );
  }

  if (!venue) {
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
        <Link to={`/venue/${venue._id}`} style={styles.back}>
          ← Back to Sablah Details
        </Link>

        <h1 style={styles.title}>Book Your Sablah</h1>

        <p style={styles.subtitle}>
          Complete the form below to submit your booking request.
        </p>

        <div style={styles.venueCard}>
          <h2>{venue.nameEn}</h2>

          <p dir="rtl">{venue.nameAr}</p>

          <p>
            📍 {venue.area || venue.wilayat}, {venue.governorate}
          </p>

          <p>
            👥 Maximum capacity: {venue.capacity} guests
          </p>

          <h3>
            OMR {Number(venue.price).toFixed(3)} / day
          </h3>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success}
          </div>
        )}

        {bookingSubmitted ? (
          <div style={styles.confirmation}>
            <div style={styles.successIcon}>✓</div>

            <h2 style={styles.confirmationTitle}>
              Booking Request Submitted!
            </h2>

            <p style={styles.confirmationText}>
              Your booking request has been sent successfully.
              You can check its status in your bookings once that page is available.
            </p>

            <Link to="/venues" style={styles.submitButton}>
              Back to Venues
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              Booking Date *
            </label>

            <input
              type="date"
              value={bookingDate}
              min={today}
              onChange={(e) => setBookingDate(e.target.value)}
              required
              style={styles.input}
            />

            <label style={styles.label}>
              Number of Guests *
            </label>

            <input
              type="number"
              min="1"
              max={venue.capacity}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              required
              style={styles.input}
            />

            <label style={styles.label}>
              Additional Notes (Optional)
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write any additional requests..."
              rows="4"
              style={styles.textarea}
            />

            <div style={styles.total}>
              Total Price: OMR {Number(venue.price).toFixed(3)}
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                ...styles.submitButton,
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? "not-allowed" : "pointer"
              }}
            >
              {submitting
                ? "Submitting..."
                : "Submit Booking Request"}
            </button>
          </form>
        )}
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
    maxWidth: "750px",
    margin: "auto",
    background: "#fff",
    padding: "35px",
    borderRadius: "20px",
    border: "1px solid #e8dfd2"
  },

  back: {
    color: "#9a741e",
    textDecoration: "none",
    fontWeight: "600"
  },

  title: {
    fontFamily: "serif",
    fontSize: "38px",
    marginTop: "25px",
    color: "#222"
  },

  subtitle: {
    color: "#777",
    marginBottom: "25px"
  },

  venueCard: {
    background: "#f8f5f1",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "25px"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  label: {
    fontWeight: "600",
    color: "#333",
    marginTop: "10px"
  },

  input: {
    padding: "14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px"
  },

  textarea: {
    padding: "14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    resize: "vertical"
  },

  total: {
    marginTop: "15px",
    fontSize: "21px",
    fontWeight: "bold",
    color: "#9a741e"
  },

  submitButton: {
    display: "block",
    textAlign: "center",
    textDecoration: "none",
    marginTop: "15px",
    padding: "16px",
    background: "#b8860b",
    color: "white",
    border: "none",
    borderRadius: "9px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer"
  },

  error: {
    background: "#fdecec",
    color: "#b42318",
    padding: "14px",
    borderRadius: "8px",
    marginBottom: "15px"
  },

  success: {
    background: "#e9f7ef",
    color: "#18794e",
    padding: "14px",
    borderRadius: "8px",
    marginBottom: "15px"
  },

  confirmation: {
    textAlign: "center",
    padding: "25px 10px"
  },

  successIcon: {
    width: "65px",
    height: "65px",
    borderRadius: "50%",
    background: "#e9f7ef",
    color: "#18794e",
    fontSize: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px"
  },

  confirmationTitle: {
    color: "#18794e",
    fontSize: "24px",
    marginBottom: "12px"
  },

  confirmationText: {
    color: "#666",
    lineHeight: "1.7",
    marginBottom: "20px"
  },

  message: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px"
  },

  backButton: {
    color: "#b8860b"
  }
};
