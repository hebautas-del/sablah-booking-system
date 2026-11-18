
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [dateError, setDateError] = useState("");
  const [dateSuccess, setDateSuccess] = useState("");

  // Feedback states
  const [feedbackByBooking, setFeedbackByBooking] = useState({});
  const [feedbackFormBookingId, setFeedbackFormBookingId] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedbackId, setSubmittingFeedbackId] = useState(null);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  const getToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getDateInputValue = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return [
      parsedDate.getUTCFullYear(),
      String(parsedDate.getUTCMonth() + 1).padStart(2, "0"),
      String(parsedDate.getUTCDate()).padStart(2, "0")
    ].join("-");
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/bookings/my-bookings");

      setBookings(Array.isArray(response.data) ? response.data : []);

      // Load feedback already submitted by this user
      try {
        const feedbackResponse = await API.get("/feedback/my-feedback");

        const feedbackMap = {};

        if (Array.isArray(feedbackResponse.data)) {
          feedbackResponse.data.forEach((feedback) => {
            const bookingId =
              typeof feedback.booking === "object"
                ? feedback.booking?._id
                : feedback.booking;

            if (bookingId) {
              feedbackMap[bookingId] = feedback;
            }
          });
        }

        setFeedbackByBooking(feedbackMap);
      } catch (feedbackErr) {
        console.error("Fetch My Feedback Error:", feedbackErr);
      }
    } catch (err) {
      console.error("Fetch My Bookings Error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(bookingId);

      const response = await API.put(
        `/bookings/${bookingId}/cancel`
      );

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                status: response.data.booking?.status || "cancelled"
              }
            : booking
        )
      );

      alert("Booking cancelled successfully.");
    } catch (err) {
      console.error("Cancel Booking Error:", err);

      alert(
        err.response?.data?.message ||
        "Unable to cancel booking."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const handleOpenDateEditor = (booking) => {
    setEditingId(booking._id);
    setSelectedDate(getDateInputValue(booking.bookingDate));
    setDateError("");
    setDateSuccess("");
  };

  const handleUpdateDate = async (bookingId) => {
    setDateError("");
    setDateSuccess("");

    if (!selectedDate) {
      setDateError("Please select a new booking date.");
      return;
    }

    if (selectedDate < getToday()) {
      setDateError("Please select today or a future date.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to change your booking date? If your booking was approved, it will return to Pending for the owner's review."
    );

    if (!confirmed) return;

    try {
      setUpdatingId(bookingId);

      const response = await API.put(
        `/bookings/${bookingId}/date`,
        { bookingDate: selectedDate }
      );

      const updatedBooking = response.data.booking;

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                ...(updatedBooking || {}),
                bookingDate:
                  updatedBooking?.bookingDate || selectedDate,
                status: updatedBooking?.status || "pending"
              }
            : booking
        )
      );

      setEditingId(null);
      setSelectedDate("");
      setDateSuccess(
        "Booking date updated successfully. Your request is now Pending for the owner's review."
      );
    } catch (err) {
      console.error("Update Booking Date Error:", err);

      setDateError(
        err.response?.data?.message ||
        "Unable to update booking date."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Check if the booking is eligible for feedback
  const canSubmitFeedback = (booking) => {
    if (booking.status !== "approved") return false;

    const bookingDate = getDateInputValue(booking.bookingDate);

    return bookingDate !== "" && bookingDate < getToday();
  };

  // Open feedback form
  const handleOpenFeedback = (bookingId) => {
    setFeedbackFormBookingId(bookingId);
    setFeedbackRating(5);
    setFeedbackComment("");
    setFeedbackError("");
    setFeedbackSuccess("");
  };

  // Submit feedback
  const handleSubmitFeedback = async (bookingId) => {
    setFeedbackError("");
    setFeedbackSuccess("");

    if (!feedbackRating || feedbackRating < 1 || feedbackRating > 5) {
      setFeedbackError("Please select a rating between 1 and 5.");
      return;
    }

    try {
      setSubmittingFeedbackId(bookingId);

      const response = await API.post("/feedback", {
        bookingId,
        rating: feedbackRating,
        comment: feedbackComment.trim()
      });

      const submittedFeedback = response.data.feedback;

      setFeedbackByBooking((prev) => ({
        ...prev,
        [bookingId]: submittedFeedback
      }));

      setFeedbackFormBookingId(null);
      setFeedbackComment("");
      setFeedbackRating(5);
      setFeedbackSuccess("Your feedback has been submitted successfully.");
    } catch (err) {
      console.error("Submit Feedback Error:", err);

      setFeedbackError(
        err.response?.data?.message ||
        "Unable to submit feedback. Please try again."
      );
    } finally {
      setSubmittingFeedbackId(null);
    }
  };

  const getStatus = (status) => {
    const statuses = {
      pending: {
        label: "Pending",
        description: "Your request is waiting for the owner's approval.",
        background: "#fff4d6",
        color: "#9a741e"
      },
      approved: {
        label: "Approved",
        description: "Your booking has been approved!",
        background: "#e5f6eb",
        color: "#18794e"
      },
      rejected: {
        label: "Rejected",
        description: "Unfortunately, your booking request was rejected.",
        background: "#fde8e7",
        color: "#b42318"
      },
      cancelled: {
        label: "Cancelled",
        description: "This booking has been cancelled.",
        background: "#eeeeee",
        color: "#666666"
      }
    };

    return statuses[status] || statuses.pending;
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    });
  };

  if (loading) {
    return (
      <div style={styles.message}>
        Loading your bookings...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>My Bookings</h1>

        <p style={styles.subtitle}>
          View and manage your Sablah booking requests.
        </p>

        {error && (
          <div style={styles.error}>
            {error}
            <button onClick={fetchBookings} style={styles.retryButton}>
              Try Again
            </button>
          </div>
        )}

        {dateSuccess && (
          <div style={styles.success}>
            {dateSuccess}
          </div>
        )}

        {feedbackSuccess && (
          <div style={styles.success}>
            {feedbackSuccess}
          </div>
        )}

        {!error && bookings.length === 0 && (
          <div style={styles.empty}>
            <h2>No Bookings Yet</h2>

            <p>
              You haven't made any booking requests yet.
            </p>

            <Link to="/venues" style={styles.browseButton}>
              Browse Sablahs
            </Link>
          </div>
        )}

        {bookings.length > 0 && (
          <div style={styles.list}>
            {bookings.map((booking) => {
              const status = getStatus(booking.status);
              const sablah = booking.sablah;

              const canEditDate =
                booking.status === "pending" ||
                booking.status === "approved";

              const canReview = canSubmitFeedback(booking);
              const existingFeedback = feedbackByBooking[booking._id];
              const isFeedbackFormOpen =
                feedbackFormBookingId === booking._id;

              return (
                <div key={booking._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h2 style={styles.sablahName}>
                        {sablah?.nameEn || "Sablah"}
                      </h2>

                      {sablah?.nameAr && (
                        <p style={styles.arabicName} dir="rtl">
                          {sablah.nameAr}
                        </p>
                      )}
                    </div>

                    <span
                      style={{
                        ...styles.badge,
                        background: status.background,
                        color: status.color
                      }}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div style={styles.details}>
                    <div style={styles.detail}>
                      <span style={styles.detailLabel}>
                        Booking Date
                      </span>
                      <strong>{formatDate(booking.bookingDate)}</strong>
                    </div>

                    <div style={styles.detail}>
                      <span style={styles.detailLabel}>
                        Guests
                      </span>
                      <strong>{booking.guests}</strong>
                    </div>

                    <div style={styles.detail}>
                      <span style={styles.detailLabel}>
                        Total Price
                      </span>
                      <strong>
                        OMR {Number(booking.totalPrice || 0).toFixed(3)}
                      </strong>
                    </div>

                    <div style={styles.detail}>
                      <span style={styles.detailLabel}>
                        Location
                      </span>
                      <strong>
                        {sablah?.wilayat || sablah?.governorate || "Not available"}
                      </strong>
                    </div>
                  </div>

                  <p
                    style={{
                      ...styles.statusDescription,
                      color: status.color
                    }}
                  >
                    {status.description}
                  </p>

                  {booking.rejectionReason && (
                    <div style={styles.rejection}>
                      <strong>Reason for rejection:</strong>
                      <p>{booking.rejectionReason}</p>
                    </div>
                  )}

                  {booking.notes && (
                    <div style={styles.notes}>
                      <strong>Your Notes:</strong>
                      <p>{booking.notes}</p>
                    </div>
                  )}

                  {dateError && editingId === booking._id && (
                    <div style={styles.error}>
                      {dateError}
                    </div>
                  )}

                  {canEditDate && (
                    <div style={styles.dateSection}>
                      {editingId === booking._id ? (
                        <>
                          <label style={styles.dateLabel}>
                            Select New Booking Date
                          </label>

                          <input
                            type="date"
                            value={selectedDate}
                            min={getToday()}
                            onChange={(e) => {
                              setSelectedDate(e.target.value);
                              setDateError("");
                            }}
                            style={styles.dateInput}
                          />

                          <p style={styles.dateHint}>
                            If your booking is already approved, changing the date will send it back to the owner for approval.
                          </p>

                          <div style={styles.dateActions}>
                            <button
                              onClick={() => handleUpdateDate(booking._id)}
                              disabled={updatingId === booking._id}
                              style={{
                                ...styles.updateButton,
                                opacity:
                                  updatingId === booking._id ? 0.6 : 1
                              }}
                            >
                              {updatingId === booking._id
                                ? "Updating..."
                                : "Confirm New Date"}
                            </button>

                            <button
                              onClick={() => {
                                setEditingId(null);
                                setSelectedDate("");
                                setDateError("");
                              }}
                              disabled={updatingId === booking._id}
                              style={styles.closeButton}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenDateEditor(booking)}
                          style={styles.changeDateButton}
                        >
                          Change Booking Date
                        </button>
                      )}
                    </div>
                  )}

                  {/* Feedback Section */}
                  {canReview && (
                    <div style={styles.feedbackSection}>
                      <h3 style={styles.feedbackTitle}>
                        Sablah Feedback
                      </h3>

                      {existingFeedback ? (
                        <div style={styles.submittedFeedback}>
                          <p style={styles.submittedLabel}>
                            You have already submitted your feedback.
                          </p>

                          <div style={styles.starsDisplay}>
                            {"★".repeat(existingFeedback.rating)}
                            {"☆".repeat(5 - existingFeedback.rating)}
                          </div>

                          <p style={styles.feedbackRatingText}>
                            Rating: {existingFeedback.rating}/5
                          </p>

                          {existingFeedback.comment && (
                            <p style={styles.feedbackComment}>
                              {existingFeedback.comment}
                            </p>
                          )}
                        </div>
                      ) : (
                        <>
                          {!isFeedbackFormOpen ? (
                            <div>
                              <p style={styles.feedbackHint}>
                                Your booking date has passed. Share your experience with this Sablah.
                              </p>

                              <button
                                onClick={() => handleOpenFeedback(booking._id)}
                                style={styles.feedbackButton}
                              >
                                Submit Feedback
                              </button>
                            </div>
                          ) : (
                            <div style={styles.feedbackForm}>
                              <label style={styles.feedbackLabel}>
                                Your Rating
                              </label>

                              <div style={styles.ratingButtons}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFeedbackRating(star)}
                                    style={{
                                      ...styles.starButton,
                                      color:
                                        star <= feedbackRating
                                          ? "#d69e18"
                                          : "#c9c9c9"
                                    }}
                                    aria-label={`Rate ${star} out of 5`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>

                              <p style={styles.ratingHint}>
                                {feedbackRating} out of 5 stars
                              </p>

                              <label style={styles.feedbackLabel}>
                                Your Comment (Optional)
                              </label>

                              <textarea
                                value={feedbackComment}
                                onChange={(e) =>
                                  setFeedbackComment(e.target.value)
                                }
                                maxLength={1000}
                                placeholder="Share your experience..."
                                rows={4}
                                style={styles.feedbackTextarea}
                              />

                              <p style={styles.characterCount}>
                                {feedbackComment.length}/1000
                              </p>

                              {feedbackError && (
                                <div style={styles.error}>
                                  {feedbackError}
                                </div>
                              )}

                              <div style={styles.dateActions}>
                                <button
                                  onClick={() =>
                                    handleSubmitFeedback(booking._id)
                                  }
                                  disabled={
                                    submittingFeedbackId === booking._id
                                  }
                                  style={{
                                    ...styles.feedbackButton,
                                    opacity:
                                      submittingFeedbackId === booking._id
                                        ? 0.6
                                        : 1
                                  }}
                                >
                                  {submittingFeedbackId === booking._id
                                    ? "Submitting..."
                                    : "Submit Rating"}
                                </button>

                                <button
                                  onClick={() => {
                                    setFeedbackFormBookingId(null);
                                    setFeedbackError("");
                                  }}
                                  disabled={
                                    submittingFeedbackId === booking._id
                                  }
                                  style={styles.closeButton}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {(booking.status === "pending" ||
                    booking.status === "approved") && (
                    <div style={styles.actions}>
                      <button
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancellingId === booking._id}
                        style={{
                          ...styles.cancelButton,
                          opacity:
                            cancellingId === booking._id ? 0.6 : 1
                        }}
                      >
                        {cancellingId === booking._id
                          ? "Cancelling..."
                          : "Cancel Booking"}
                      </button>
                    </div>
                  )}
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
    padding: "120px 20px 70px"
  },

  container: {
    maxWidth: "1000px",
    margin: "auto"
  },

  title: {
    fontSize: "38px",
    fontFamily: "serif",
    color: "#b8860b",
    marginBottom: "10px"
  },

  subtitle: {
    color: "#777",
    marginBottom: "30px"
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },

  card: {
    background: "white",
    padding: "25px",
    borderRadius: "16px",
    border: "1px solid #e8dfd2",
    boxShadow: "0 3px 12px rgba(0,0,0,0.04)"
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "20px"
  },

  sablahName: {
    color: "#333",
    fontSize: "23px",
    margin: "0 0 7px"
  },

  arabicName: {
    color: "#777",
    margin: 0,
    fontSize: "17px"
  },

  badge: {
    padding: "8px 15px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "13px"
  },

  details: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "18px",
    background: "#faf8f5",
    padding: "18px",
    borderRadius: "12px"
  },

  detail: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    color: "#333"
  },

  detailLabel: {
    color: "#888",
    fontSize: "13px"
  },

  statusDescription: {
    fontSize: "14px",
    marginTop: "18px",
    fontWeight: "600"
  },

  rejection: {
    background: "#fdecec",
    color: "#b42318",
    padding: "14px",
    borderRadius: "9px",
    marginTop: "15px"
  },

  notes: {
    background: "#f8f5f1",
    padding: "14px",
    borderRadius: "9px",
    marginTop: "15px",
    color: "#555"
  },

  dateSection: {
    marginTop: "20px",
    padding: "18px",
    background: "#faf8f5",
    borderRadius: "10px"
  },

  dateLabel: {
    display: "block",
    color: "#555",
    fontWeight: "600",
    marginBottom: "10px"
  },

  dateInput: {
    width: "100%",
    maxWidth: "320px",
    padding: "11px",
    border: "1px solid #d8cbb8",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box"
  },

  dateHint: {
    color: "#777",
    fontSize: "13px",
    lineHeight: "1.6",
    marginTop: "10px"
  },

  dateActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "15px"
  },

  changeDateButton: {
    background: "#b8860b",
    color: "white",
    border: "none",
    padding: "11px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  },

  updateButton: {
    background: "#18794e",
    color: "white",
    border: "none",
    padding: "11px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  },

  closeButton: {
    background: "white",
    color: "#555",
    border: "1px solid #ccc",
    padding: "11px 18px",
    borderRadius: "8px",
    cursor: "pointer"
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px"
  },

  cancelButton: {
    background: "white",
    color: "#b42318",
    border: "1px solid #b42318",
    padding: "11px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  },

  // Feedback styles
  feedbackSection: {
    marginTop: "20px",
    padding: "20px",
    background: "#fffcf5",
    border: "1px solid #eee2c9",
    borderRadius: "12px"
  },

  feedbackTitle: {
    color: "#8b6816",
    fontSize: "19px",
    margin: "0 0 12px"
  },

  feedbackHint: {
    color: "#777",
    fontSize: "14px",
    lineHeight: "1.6"
  },

  feedbackButton: {
    background: "#b8860b",
    color: "white",
    border: "none",
    padding: "11px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  },

  feedbackForm: {
    marginTop: "12px"
  },

  feedbackLabel: {
    display: "block",
    color: "#555",
    fontWeight: "600",
    marginBottom: "9px"
  },

  ratingButtons: {
    display: "flex",
    gap: "7px",
    marginBottom: "5px"
  },

  starButton: {
    background: "transparent",
    border: "none",
    fontSize: "32px",
    cursor: "pointer",
    padding: "0 3px"
  },

  ratingHint: {
    color: "#888",
    fontSize: "13px",
    marginTop: "0",
    marginBottom: "18px"
  },

  feedbackTextarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #d8cbb8",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical"
  },

  characterCount: {
    textAlign: "right",
    color: "#999",
    fontSize: "12px",
    marginTop: "5px"
  },

  submittedFeedback: {
    background: "white",
    padding: "15px",
    borderRadius: "9px",
    border: "1px solid #e8dfd2"
  },

  submittedLabel: {
    color: "#18794e",
    fontWeight: "600",
    fontSize: "14px"
  },

  starsDisplay: {
    color: "#d69e18",
    fontSize: "25px",
    letterSpacing: "3px"
  },

  feedbackRatingText: {
    color: "#666",
    fontSize: "13px"
  },

  feedbackComment: {
    color: "#555",
    lineHeight: "1.6",
    marginBottom: "0"
  },

  empty: {
    textAlign: "center",
    background: "white",
    padding: "50px 20px",
    borderRadius: "16px",
    border: "1px solid #e8dfd2"
  },

  browseButton: {
    display: "inline-block",
    background: "#b8860b",
    color: "white",
    textDecoration: "none",
    padding: "13px 25px",
    borderRadius: "9px",
    marginTop: "15px"
  },

  error: {
    background: "#fdecec",
    color: "#b42318",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px"
  },

  success: {
    background: "#e5f6eb",
    color: "#18794e",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px"
  },

  retryButton: {
    display: "block",
    marginTop: "10px",
    padding: "8px 15px",
    cursor: "pointer"
  },

  message: {
    minHeight: "60vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#777"
  }
};
