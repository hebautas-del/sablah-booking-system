
import { useEffect, useState } from "react";
import axios from "axios";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const language = localStorage.getItem("language") || "en";
  const isArabic = language === "ar";

  const API_URL = "http://localhost:5000/api/notifications";

  const text = {
    title: isArabic ? "الإشعارات" : "Notifications",
    subtitle: isArabic
      ? "تابع آخر التحديثات المتعلقة بحجوزاتك."
      : "Stay updated with your booking activities.",
    all: isArabic ? "الكل" : "All",
    unread: isArabic ? "غير مقروءة" : "Unread",
    markAll: isArabic ? "تحديد الكل كمقروء" : "Mark All as Read",
    loading: isArabic ? "جاري تحميل الإشعارات..." : "Loading notifications...",
    empty: isArabic ? "لا توجد إشعارات حتى الآن" : "No notifications yet",
    emptyDescription: isArabic
      ? "ستظهر هنا التحديثات الجديدة المتعلقة بحجوزاتك."
      : "New updates about your bookings will appear here.",
    markRead: isArabic ? "تحديد كمقروء" : "Mark as Read",
    delete: isArabic ? "حذف" : "Delete",
    newBooking: isArabic ? "طلب حجز جديد" : "New Booking Request",
    approved: isArabic ? "تم قبول الحجز" : "Booking Approved",
    rejected: isArabic ? "تم رفض الحجز" : "Booking Rejected",
    cancelled: isArabic ? "تم إلغاء الحجز" : "Booking Cancelled",
    dateUpdated: isArabic ? "تم تعديل تاريخ الحجز" : "Booking Date Updated",
    error: isArabic
      ? "تعذر تحميل الإشعارات."
      : "Failed to load notifications.",
    actionError: isArabic
      ? "تعذر تنفيذ العملية."
      : "Failed to complete the action.",
    back: isArabic ? "العودة للرئيسية" : "Back to Home",
  };

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  // GET NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, {
        headers: getHeaders(),
      });

      setNotifications(response.data);
    } catch (err) {
      console.error("Fetch Notifications Error:", err);
      setError(text.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // MARK ONE NOTIFICATION AS READ
  const markAsRead = async (id) => {
    try {
      await axios.put(
        `${API_URL}/${id}/read`,
        {},
        { headers: getHeaders() }
      );

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === id
            ? { ...item, isRead: true }
            : item
        )
      );

      window.dispatchEvent(new Event("notificationschange"));

    } catch (err) {
      console.error("Mark Notification Error:", err);
      alert(text.actionError);
    }
  };

  // MARK ALL NOTIFICATIONS AS READ
  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${API_URL}/read-all`,
        {},
        { headers: getHeaders() }
      );

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      window.dispatchEvent(new Event("notificationschange"));

    } catch (err) {
      console.error("Mark All Notifications Error:", err);
      alert(text.actionError);
    }
  };

  // DELETE NOTIFICATION
  const deleteNotification = async (id) => {
    const confirmed = window.confirm(
      isArabic
        ? "هل تريد حذف هذا الإشعار؟"
        : "Are you sure you want to delete this notification?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/${id}`,
        { headers: getHeaders() }
      );

      setNotifications((previous) =>
        previous.filter((item) => item._id !== id)
      );

      window.dispatchEvent(new Event("notificationschange"));

    } catch (err) {
      console.error("Delete Notification Error:", err);
      alert(text.actionError);
    }
  };

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const getNotificationTitle = (type) => {
    const titles = {
      new_booking: text.newBooking,
      booking_approved: text.approved,
      booking_rejected: text.rejected,
      booking_cancelled: text.cancelled,
      booking_date_updated: text.dateUpdated,
    };

    return titles[type] || text.title;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString(
      isArabic ? "ar-OM" : "en-GB",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  const pageStyle = {
    minHeight: "70vh",
    padding: "45px 20px",
    background: "#faf7f2",
    direction: isArabic ? "rtl" : "ltr",
  };

  const containerStyle = {
    maxWidth: "850px",
    margin: "0 auto",
  };

  const cardStyle = (isRead) => ({
    background: isRead ? "#ffffff" : "#fffaf0",
    border: "1px solid #e8dfd1",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "15px",
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
  });

  const buttonStyle = {
    border: "none",
    borderRadius: "8px",
    padding: "9px 13px",
    cursor: "pointer",
    fontSize: "13px",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* HEADER */}
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ color: "#44382d", marginBottom: "8px" }}>
            🔔 {text.title}
          </h1>

          <p style={{ color: "#817568" }}>
            {text.subtitle}
          </p>

          <p style={{ color: "#8b6745", fontWeight: "600" }}>
            {isArabic
              ? `${unreadCount} إشعار غير مقروء`
              : `${unreadCount} unread notifications`}
          </p>
        </div>

        {/* ACTIONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "22px",
          }}
        >
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                ...buttonStyle,
                background: "#8b6745",
                color: "white",
              }}
            >
              {text.markAll}
            </button>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <p style={{ textAlign: "center", color: "#817568" }}>
            {text.loading}
          </p>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div style={{ textAlign: "center", color: "#b42318" }}>
            <p>{error}</p>
            <button onClick={fetchNotifications}>
              {isArabic ? "إعادة المحاولة" : "Try Again"}
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && notifications.length === 0 && (
          <div
            style={{
              textAlign: "center",
              background: "white",
              padding: "45px 20px",
              borderRadius: "14px",
              border: "1px solid #e8dfd1",
            }}
          >
            <div style={{ fontSize: "45px" }}>🔔</div>

            <h3 style={{ color: "#44382d" }}>
              {text.empty}
            </h3>

            <p style={{ color: "#817568" }}>
              {text.emptyDescription}
            </p>
          </div>
        )}

        {/* NOTIFICATION LIST */}
        {!loading && !error && notifications.map((item) => (
          <div
            key={item._id}
            style={cardStyle(item.isRead)}
          >
            <div style={{ fontSize: "25px" }}>
              {item.type === "new_booking" ? "📅" :
               item.type === "booking_approved" ? "✅" :
               item.type === "booking_rejected" ? "❌" :
               item.type === "booking_cancelled" ? "🚫" :
               "🔄"}
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 8px",
                    color: "#44382d",
                    fontSize: "17px",
                  }}
                >
                  {getNotificationTitle(item.type)}
                </h3>

                {!item.isRead && (
                  <span
                    style={{
                      background: "#f3e5c8",
                      color: "#805b2c",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                    }}
                  >
                    {text.unread}
                  </span>
                )}
              </div>

              <p style={{ color: "#6f6257", lineHeight: 1.6 }}>
                {item.message}
              </p>

              <small style={{ color: "#9a8d80" }}>
                {formatDate(item.createdAt)}
              </small>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "15px",
                }}
              >
                {!item.isRead && (
                  <button
                    onClick={() => markAsRead(item._id)}
                    style={{
                      ...buttonStyle,
                      background: "#eee5d9",
                      color: "#5b4635",
                    }}
                  >
                    {text.markRead}
                  </button>
                )}

                <button
                  onClick={() => deleteNotification(item._id)}
                  style={{
                    ...buttonStyle,
                    background: "#fce8e6",
                    color: "#b42318",
                  }}
                >
                  {text.delete}
                </button>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
