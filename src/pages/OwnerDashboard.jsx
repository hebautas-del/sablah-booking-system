
import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../api";

const WILAYATS = [
  "Muscat",
  "Muttrah",
  "Bawshar",
  "Seeb",
  "Al Amerat",
  "Qurayyat"
];

const FACILITIES = [
  "Parking",
  "Air Conditioning",
  "Kitchen",
  "Bathrooms",
  "Outdoor Seating",
  "Private Entrance",
  "Wi-Fi",
  "Dining Area"
];

const API_BASE = "http://localhost:5000";

const emptyForm = {
  nameEn: "",
  nameAr: "",
  governorate: "Muscat",
  wilayat: "",
  capacity: "",
  price: "",
  address: "",
  locationLat: null,
  locationLng: null,
  descriptionEn: "",
  descriptionAr: "",
  amenities: [],
  existingImages: [],
  images: []
};

const STATUS_STYLES = {
  pending: { background: "#fff3cd", color: "#856404" },
  approved: { background: "#d4edda", color: "#155724" },
  rejected: { background: "#f8d7da", color: "#721c24" },
  cancelled: { background: "#e2e3e5", color: "#383d41" }
};

export default function OwnerDashboard() {
  const name = localStorage.getItem("name") || "Owner";

  const [searchParams, setSearchParams] = useSearchParams();

  const requestedSection =
    searchParams.get("tab") === "bookings" ? "bookings" : "sablahs";

  const [sablahs, setSablahs] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState(requestedSection);

  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [bookingActionId, setBookingActionId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(emptyForm);
  const venueMapElement = useRef(null);
  const venueMapInstance = useRef(null);
  const venueMarkerInstance = useRef(null);

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const fetchMySablahs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/owner/my-sablahs");
      setSablahs(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Fetch Sablahs Error:", err);
      setError(
        err.response?.data?.message ||
        "Failed to load your sablahs."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerBookings = async () => {
    try {
      setBookingsLoading(true);

      const response = await API.get("/bookings/owner");

      setBookings(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Fetch Owner Bookings Error:", err);
      setError(
        err.response?.data?.message ||
        "Failed to load booking requests."
      );
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchMySablahs();
    fetchOwnerBookings();
  }, []);

  // Interactive map for the exact Sablah venue location.
  useEffect(() => {
    if (!showForm || !venueMapElement.current) return undefined;
    let cancelled = false;

    const loadLeaflet = () => new Promise((resolve, reject) => {
      if (window.L) return resolve(window.L);
      const existing = document.querySelector('script[data-leaflet="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(window.L), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      if (!document.querySelector('link[data-leaflet="true"]')) {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        css.dataset.leaflet = "true";
        document.head.appendChild(css);
      }
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.dataset.leaflet = "true";
      script.onload = () => resolve(window.L);
      script.onerror = reject;
      document.body.appendChild(script);
    });

    loadLeaflet().then((L) => {
      if (cancelled || !venueMapElement.current || venueMapInstance.current) return;
      const hasSavedPoint = Number.isFinite(Number(form.locationLat)) &&
        Number.isFinite(Number(form.locationLng)) &&
        form.locationLat !== null && form.locationLng !== null;
      const initialPoint = hasSavedPoint
        ? [Number(form.locationLat), Number(form.locationLng)]
        : [23.5880, 58.3829];
      const map = L.map(venueMapElement.current).setView(initialPoint, hasSavedPoint ? 15 : 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);
      const marker = L.marker(initialPoint, { draggable: true }).addTo(map);
      const savePoint = (point) => setForm((previous) => ({
        ...previous,
        locationLat: Number(point.lat.toFixed(6)),
        locationLng: Number(point.lng.toFixed(6))
      }));
      map.on("click", (event) => {
        marker.setLatLng(event.latlng);
        savePoint(event.latlng);
      });
      marker.on("dragend", () => savePoint(marker.getLatLng()));
      venueMapInstance.current = map;
      venueMarkerInstance.current = marker;
      window.setTimeout(() => map.invalidateSize(), 100);
    }).catch((error) => console.error("Venue map loading failed:", error));

    return () => {
      cancelled = true;
      if (venueMapInstance.current) {
        venueMapInstance.current.remove();
        venueMapInstance.current = null;
        venueMarkerInstance.current = null;
      }
    };
  }, [showForm, editingId]);

  // Keep the displayed section synchronized with the URL.
  useEffect(() => {
    const nextSection =
      searchParams.get("tab") === "bookings" ? "bookings" : "sablahs";

    setActiveTab(nextSection);

    if (nextSection === "bookings") {
      setShowForm(false);
      setEditingId(null);
    }
  }, [searchParams]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleFacilityChange = (facility) => {
    setForm((previous) => {
      const exists = previous.amenities.includes(facility);

      return {
        ...previous,
        amenities: exists
          ? previous.amenities.filter((item) => item !== facility)
          : [...previous.amenities, facility]
      };
    });
  };

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 10 * 1024 * 1024;

    const validFiles = [];
    let imageError = "";

    selectedFiles.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        imageError = "Please select JPG, PNG or WEBP images only.";
        return;
      }

      if (file.size > maxSize) {
        imageError = "Each image must be 10 MB or smaller.";
        return;
      }

      validFiles.push(file);
    });

    const remainingSlots =
      10 - form.existingImages.length - form.images.length;

    const acceptedFiles = validFiles.slice(
      0,
      Math.max(0, remainingSlots)
    );

    if (validFiles.length > remainingSlots) {
      imageError = "You can upload up to 10 images in total.";
    }

    setError(imageError);

    setForm((previous) => ({
      ...previous,
      images: [...previous.images, ...acceptedFiles]
    }));

    event.target.value = "";
  };

  const removeNewImage = (index) => {
    setForm((previous) => ({
      ...previous,
      images: previous.images.filter((_, i) => i !== index)
    }));
  };

  const removeExistingImage = (imagePath) => {
    setForm((previous) => ({
      ...previous,
      existingImages: previous.existingImages.filter(
        (image) => image !== imagePath
      )
    }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startEditing = (sablah) => {
    const oldImages = sablah.images?.length
      ? sablah.images
      : sablah.image
        ? [sablah.image]
        : [];

    setForm({
      nameEn: sablah.nameEn || "",
      nameAr: sablah.nameAr || "",
      governorate: sablah.governorate || "Muscat",
      wilayat: sablah.wilayat || sablah.area || "",
      capacity: String(sablah.capacity ?? ""),
      price: String(sablah.price ?? ""),
      address: sablah.address || "",
      locationLat: sablah.locationLat ?? null,
      locationLng: sablah.locationLng ?? null,
      descriptionEn: sablah.descriptionEn || "",
      descriptionAr: sablah.descriptionAr || "",
      amenities: sablah.amenities || [],
      existingImages: oldImages,
      images: []
    });

    setEditingId(sablah._id);
    setShowForm(true);
    setActiveTab("sablahs");
    setSearchParams({ tab: "sablahs" });
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleSaveSablah = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.wilayat) {
        setError("Please select a wilayat.");
        return;
      }

      if (form.locationLat === null || form.locationLng === null) {
        setError("Please select the exact Sablah location on the map.");
        return;
      }

      if (form.existingImages.length + form.images.length > 10) {
        setError("You can upload up to 10 images in total.");
        return;
      }

      const formData = new FormData();

      formData.append("nameEn", form.nameEn.trim());
      formData.append("nameAr", form.nameAr.trim());
      formData.append("governorate", form.governorate);
      formData.append("wilayat", form.wilayat);
      formData.append("capacity", form.capacity);
      formData.append("price", form.price);
      formData.append("address", form.address.trim());
      formData.append("locationLat", String(form.locationLat));
      formData.append("locationLng", String(form.locationLng));
      formData.append("descriptionEn", form.descriptionEn.trim());
      formData.append("descriptionAr", form.descriptionAr.trim());
      formData.append("amenities", JSON.stringify(form.amenities));

      formData.append(
        "existingImages",
        JSON.stringify(form.existingImages)
      );

      form.images.forEach((file) => {
        formData.append("images", file);
      });

      if (editingId) {
        const response = await API.put(
          `/owner/sablahs/${editingId}`,
          formData
        );

        setSablahs((previous) =>
          previous.map((item) =>
            item._id === editingId ? response.data.sablah : item
          )
        );

        setSuccess("Sablah updated successfully!");
      } else {
        const response = await API.post("/owner/sablahs", formData);

        setSablahs((previous) => [
          response.data.sablah,
          ...previous
        ]);

        setSuccess("Sablah added successfully!");
      }

      setForm({ ...emptyForm });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error("Save Sablah Error:", err);
      setError(
        err.response?.data?.message ||
        "Failed to save sablah. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSablah = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sablah?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await API.delete(`/owner/sablahs/${id}`);

      setSablahs((previous) =>
        previous.filter((item) => item._id !== id)
      );

      if (editingId === id) {
        resetForm();
      }

      setSuccess("Sablah deleted successfully!");
    } catch (err) {
      console.error("Delete Sablah Error:", err);
      setError(
        err.response?.data?.message ||
        "Failed to delete sablah."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    const action = status === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this booking?`
    );

    if (!confirmed) return;

    try {
      setBookingActionId(bookingId);
      setError("");
      setSuccess("");

      const response = await API.put(
        `/bookings/${bookingId}/status`,
        { status }
      );

      const updatedBooking = response.data?.booking || response.data;

      setBookings((previous) =>
        previous.map((booking) =>
          booking._id === bookingId
            ? { ...booking, ...updatedBooking }
            : booking
        )
      );

      setSuccess(
        status === "approved"
          ? "Booking approved successfully!"
          : "Booking rejected successfully!"
      );
    } catch (err) {
      console.error("Update Booking Status Error:", err);
      setError(
        err.response?.data?.message ||
        "Failed to update booking status."
      );
    } finally {
      setBookingActionId(null);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE}${imagePath}`;
  };

  const formatBookingDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    });
  };

  const openBookingsTab = () => {
    setSearchParams({ tab: "bookings" });
    setActiveTab("bookings");
    resetForm();
    setError("");
    setSuccess("");
    fetchOwnerBookings();
  };

  const openSablahsTab = () => {
    setSearchParams({ tab: "sablahs" });
    setActiveTab("sablahs");
    setShowForm(false);
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <p style={styles.subTitle}>SABLAH OWNER PORTAL</p>
        <h1 style={styles.title}>Owner Dashboard</h1>

        <p style={styles.welcome}>
          Welcome back, <span style={styles.goldText}>{name}</span>
        </p>

        <p style={styles.description}>
          Manage your sablahs and property information from one place.
        </p>
      </header>

      <div style={styles.summaryContainer}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>🏠</div>
          <p style={styles.summaryLabel}>My Sablahs</p>
          <h2 style={styles.summaryNumber}>{sablahs.length}</h2>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>📅</div>
          <p style={styles.summaryLabel}>Total Bookings</p>
          <h2 style={styles.summaryNumber}>
            {bookingsLoading ? "..." : bookings.length}
          </h2>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>⏳</div>
          <p style={styles.summaryLabel}>Pending Requests</p>
          <h2 style={styles.summaryNumber}>
            {bookingsLoading ? "..." : pendingBookings}
          </h2>
        </div>
      </div>

      <div style={styles.tabs}>
        <button
          type="button"
          onClick={openSablahsTab}
          style={{
            ...styles.tabButton,
            ...(activeTab === "sablahs" ? styles.activeTab : {})
          }}
        >
          🏠 My Sablahs
        </button>

        <button
          type="button"
          onClick={openBookingsTab}
          style={{
            ...styles.tabButton,
            ...(activeTab === "bookings" ? styles.activeTab : {})
          }}
        >
          📅 Manage Bookings
        </button>
      </div>

      {error && <div style={styles.errorMessage}>{error}</div>}
      {success && <div style={styles.successMessage}>{success}</div>}

      {activeTab === "sablahs" && (
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>My Sablahs</h2>
              <p style={styles.sectionDescription}>
                Add and manage your registered sablahs.
              </p>
            </div>

            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setForm({ ...emptyForm });
                  setEditingId(null);
                  setShowForm(true);
                  setError("");
                  setSuccess("");
                }
              }}
            >
              {showForm ? "✕ Cancel" : "+ Add New Sablah"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSaveSablah} style={styles.form}>
              <h3 style={styles.formTitle}>
                {editingId ? "Edit Sablah" : "Add a New Sablah"}
              </h3>

              <p style={styles.formDescription}>
                {editingId
                  ? "Update your sablah information below."
                  : "Complete the information below to register your sablah."}
              </p>

              <div style={styles.formGrid}>
                <label style={styles.label}>
                  Sablah Name (English) *
                  <input
                    type="text"
                    name="nameEn"
                    value={form.nameEn}
                    onChange={handleChange}
                    placeholder="Example: Al Noor Majlis"
                    required
                    style={styles.input}
                  />
                </label>

                <label style={styles.label}>
                  اسم السبلة بالعربي *
                  <input
                    type="text"
                    name="nameAr"
                    value={form.nameAr}
                    onChange={handleChange}
                    placeholder="مثال: مجلس النور"
                    required
                    dir="auto"
                    style={styles.input}
                  />
                </label>

                <label style={styles.label}>
                  Governorate *
                  <select
                    name="governorate"
                    value={form.governorate}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        governorate: event.target.value,
                        wilayat: ""
                      }))
                    }
                    required
                    style={styles.input}
                  >
                    <option value="Muscat">Muscat</option>
                  </select>
                </label>

                <label style={styles.label}>
                  Wilayat *
                  <select
                    name="wilayat"
                    value={form.wilayat}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  >
                    <option value="">Select Wilayat</option>
                    {WILAYATS.map((wilayat) => (
                      <option key={wilayat} value={wilayat}>
                        {wilayat}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={styles.label}>
                  Capacity *
                  <input
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleChange}
                    placeholder="Number of guests"
                    min="1"
                    step="1"
                    required
                    style={styles.input}
                  />
                </label>

                <label style={styles.label}>
                  Price per Booking (OMR) *
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Example: 50"
                    min="0"
                    step="0.001"
                    required
                    style={styles.input}
                  />
                </label>
              </div>

              <label style={styles.label}>
                Full Address *
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter the complete address"
                  rows="2"
                  required
                  style={styles.textarea}
                />
              </label>

              <div style={{ ...styles.label, marginTop: "14px" }}>
                <div style={{ marginBottom: "8px" }}>
                  Exact Sablah Location * — click the map or drag the pin
                </div>
                <div
                  ref={venueMapElement}
                  role="application"
                  aria-label="Select the exact Sablah location on the map"
                  style={{
                    width: "100%",
                    height: "250px",
                    borderRadius: "10px",
                    border: "1px solid #d8d0c4",
                    overflow: "hidden",
                    background: "#f5f1eb",
                    zIndex: 0
                  }}
                />
                <div style={{ fontSize: "12px", fontWeight: "normal", marginTop: "7px" }}>
                  {form.locationLat !== null && form.locationLng !== null
                    ? `Selected: ${form.locationLat}, ${form.locationLng}`
                    : "No exact location selected yet. Select a point on the map."}
                </div>
              </div>

              <label style={styles.label}>
                Description (English)
                <textarea
                  name="descriptionEn"
                  value={form.descriptionEn}
                  onChange={handleChange}
                  placeholder="Describe your sablah"
                  rows="3"
                  style={styles.textarea}
                />
              </label>

              <label style={styles.label}>
                الوصف (بالعربي)
                <textarea
                  name="descriptionAr"
                  value={form.descriptionAr}
                  onChange={handleChange}
                  placeholder="اكتبي وصف السبلة بالعربي"
                  rows="3"
                  dir="auto"
                  style={styles.textarea}
                />
              </label>

              <div style={styles.facilitiesSection}>
                <h4 style={styles.subHeading}>Facilities</h4>
                <p style={styles.formDescription}>
                  Select all facilities available in your sablah.
                </p>

                <div style={styles.facilitiesGrid}>
                  {FACILITIES.map((facility) => (
                    <label key={facility} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={form.amenities.includes(facility)}
                        onChange={() => handleFacilityChange(facility)}
                      />
                      {facility}
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.imageSection}>
                <h4 style={styles.subHeading}>Sablah Images</h4>
                <p style={styles.formDescription}>
                  Select up to 10 JPG, PNG or WEBP images. Maximum 10 MB each.
                </p>

                {form.existingImages.length > 0 && (
                  <>
                    <p style={styles.formDescription}>
                      Current images — remove any image you no longer want.
                    </p>

                    <div style={styles.previewGrid}>
                      {form.existingImages.map((imagePath, index) => (
                        <div key={imagePath} style={styles.previewCard}>
                          <img
                            src={getImageUrl(imagePath)}
                            alt={`Current sablah image ${index + 1}`}
                            style={styles.previewImage}
                          />

                          <button
                            type="button"
                            style={styles.removeImageButton}
                            onClick={() => removeExistingImage(imagePath)}
                          >
                            ✕
                          </button>

                          <p style={styles.previewName}>Current image</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <label style={styles.uploadBox}>
                  <span style={styles.uploadIcon}>📷</span>
                  <strong>Click to upload images</strong>
                  <span style={styles.uploadHint}>
                    You can select multiple images
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                    style={styles.fileInput}
                  />
                </label>

                {form.images.length > 0 && (
                  <div style={styles.previewGrid}>
                    {form.images.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        style={styles.previewCard}
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New sablah preview ${index + 1}`}
                          style={styles.previewImage}
                        />

                        <button
                          type="button"
                          style={styles.removeImageButton}
                          onClick={() => removeNewImage(index)}
                        >
                          ✕
                        </button>

                        <p style={styles.previewName}>{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}

                <p style={styles.formDescription}>
                  {form.existingImages.length + form.images.length} of 10 images selected.
                </p>
              </div>

              <div style={styles.formActions}>
                <button
                  type="submit"
                  style={{
                    ...styles.primaryButton,
                    ...(saving ? styles.disabledButton : {})
                  }}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Save Sablah"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    style={styles.cancelButton}
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </form>
          )}

          {loading ? (
            <div style={styles.emptyState}>Loading your sablahs...</div>
          ) : sablahs.length === 0 && !showForm ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🏡</div>
              <h3 style={styles.emptyTitle}>No Sablahs Yet</h3>
              <p style={styles.emptyText}>
                You have not added any sablahs yet. Start by adding your first property.
              </p>

              <button
                type="button"
                style={styles.primaryButton}
                onClick={() => setShowForm(true)}
              >
                + Add Your First Sablah
              </button>
            </div>
          ) : (
            <div style={styles.sablahGrid}>
              {sablahs.map((sablah) => {
                const images = sablah.images?.length
                  ? sablah.images
                  : sablah.image
                    ? [sablah.image]
                    : [];

                return (
                  <article key={sablah._id} style={styles.sablahCard}>
                    {images.length > 0 ? (
                      <img
                        src={getImageUrl(images[0])}
                        alt={sablah.nameEn}
                        style={styles.cardImage}
                      />
                    ) : (
                      <div style={styles.propertyIcon}>🏠</div>
                    )}

                    <h3 style={styles.propertyTitle}>{sablah.nameEn}</h3>
                    <p style={styles.arabicName}>{sablah.nameAr}</p>

                    <p style={styles.propertyDetail}>
                      📍 {sablah.wilayat || sablah.area}
                    </p>

                    <p style={styles.propertyDetail}>
                      👥 Capacity: {sablah.capacity} guests
                    </p>

                    <p style={styles.propertyPrice}>
                      {Number(sablah.price).toFixed(3)} OMR
                    </p>

                    <p style={styles.propertyDetail}>
                      📌 {sablah.address}
                    </p>

                    {sablah.amenities?.length > 0 && (
                      <p style={styles.propertyDescription}>
                        Facilities: {sablah.amenities.join(", ")}
                      </p>
                    )}

                    {sablah.descriptionEn && (
                      <p style={styles.propertyDescription}>
                        {sablah.descriptionEn}
                      </p>
                    )}

                    {images.length > 1 && (
                      <p style={styles.propertyDetail}>
                        {images.length} images
                      </p>
                    )}

                    <div style={styles.cardActions}>
                      <button
                        type="button"
                        style={styles.editButton}
                        onClick={() => startEditing(sablah)}
                      >
                        ✏️ Edit Sablah
                      </button>

                      <button
                        type="button"
                        style={styles.deleteButton}
                        disabled={deletingId === sablah._id}
                        onClick={() => handleDeleteSablah(sablah._id)}
                      >
                        {deletingId === sablah._id
                          ? "Deleting..."
                          : "Delete Sablah"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === "bookings" && (
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Manage Bookings</h2>
              <p style={styles.sectionDescription}>
                Review and manage all booking requests for your sablahs.
              </p>
            </div>

            <button
              type="button"
              style={{
                ...styles.primaryButton,
                ...(bookingsLoading ? styles.disabledButton : {})
              }}
              onClick={fetchOwnerBookings}
              disabled={bookingsLoading}
            >
              {bookingsLoading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {bookingsLoading ? (
            <div style={styles.emptyState}>
              Loading booking requests...
            </div>
          ) : bookings.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📅</div>
              <h3 style={styles.emptyTitle}>No Bookings Yet</h3>
              <p style={styles.emptyText}>
                You don't have any booking requests at the moment.
                New requests will appear here.
              </p>
            </div>
          ) : (
            <div style={styles.sablahGrid}>
              {bookings.map((booking) => {
                const sablah = booking.sablah || {};
                const customer = booking.user || {};
                const statusStyle =
                  STATUS_STYLES[booking.status] || STATUS_STYLES.pending;

                return (
                  <article
                    key={booking._id}
                    style={styles.sablahCard}
                  >
                    <h3 style={styles.propertyTitle}>
                      {sablah.nameEn || "Sablah"}
                    </h3>

                    {sablah.nameAr && (
                      <p style={styles.arabicName}>
                        {sablah.nameAr}
                      </p>
                    )}

                    <span
                      style={{
                        ...styles.statusBadge,
                        background: statusStyle.background,
                        color: statusStyle.color
                      }}
                    >
                      {booking.status || "pending"}
                    </span>

                    <h4 style={styles.subHeading}>
                      Customer Information
                    </h4>

                    <p style={styles.propertyDetail}>
                      👤 {customer.name || "Name not available"}
                    </p>

                    <p style={styles.propertyDetail}>
                      ✉️ {customer.email || "Email not available"}
                    </p>

                    <p style={styles.propertyDetail}>
                      📞 {customer.phone || "Phone not provided"}
                    </p>

                    <hr style={styles.bookingDivider} />

                    <h4 style={styles.subHeading}>
                      Booking Information
                    </h4>

                    <p style={styles.propertyDetail}>
                      📅 Date: {formatBookingDate(booking.bookingDate)}
                    </p>

                    <p style={styles.propertyDetail}>
                      👥 Guests: {booking.guests ?? "Not available"}
                    </p>

                    <p style={styles.propertyPrice}>
                      {Number(booking.totalPrice || 0).toFixed(3)} OMR
                    </p>

                    {booking.notes && (
                      <div style={styles.notesBox}>
                        <strong style={{ fontSize: "13px" }}>
                          Customer Notes
                        </strong>
                        <p style={styles.propertyDetail}>
                          {booking.notes}
                        </p>
                      </div>
                    )}

                    {booking.status === "pending" && (
                      <div style={styles.cardActions}>
                        <button
                          type="button"
                          style={styles.approveButton}
                          disabled={bookingActionId === booking._id}
                          onClick={() =>
                            handleBookingStatus(
                              booking._id,
                              "approved"
                            )
                          }
                        >
                          {bookingActionId === booking._id
                            ? "Please wait..."
                            : "✓ Approve Booking"}
                        </button>

                        <button
                          type="button"
                          style={styles.deleteButton}
                          disabled={bookingActionId === booking._id}
                          onClick={() =>
                            handleBookingStatus(
                              booking._id,
                              "rejected"
                            )
                          }
                        >
                          ✕ Reject Booking
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section style={styles.profileCard}>
        <div>
          <div style={styles.profileIcon}>⚙️</div>
          <h3 style={styles.profileTitle}>Account Settings</h3>
          <p style={styles.profileText}>
            Keep your account information up to date.
          </p>
        </div>

        <Link to="/edit-profile" style={styles.profileLink}>
          Edit Profile →
        </Link>
      </section>

      <p style={styles.demoNotice}>
        Your sablah information and booking requests are managed through the database.
      </p>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f8f5f1",
    padding: "clamp(20px, 5vw, 60px)",
    boxSizing: "border-box",
    color: "#222"
  },

  header: { marginBottom: "35px" },
  subTitle: {
    color: "#b8860b",
    letterSpacing: "2px",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "10px"
  },
  title: {
    fontSize: "clamp(32px, 5vw, 48px)",
    color: "#1d1d1d",
    fontFamily: "serif",
    margin: "0 0 10px"
  },
  welcome: { color: "#666", fontSize: "18px", marginBottom: "10px" },
  goldText: { color: "#b8860b", fontWeight: "600" },
  description: { color: "#777", fontSize: "15px", lineHeight: "1.7" },

  summaryContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "35px"
  },
  summaryCard: {
    background: "white",
    borderRadius: "18px",
    padding: "25px",
    border: "1px solid #eee",
    boxShadow: "0 4px 15px rgba(0,0,0,0.04)"
  },
  summaryIcon: { fontSize: "28px", marginBottom: "12px" },
  summaryLabel: { color: "#777", fontSize: "14px", marginBottom: "8px" },
  summaryNumber: { color: "#b8860b", fontSize: "32px", margin: 0 },

  tabs: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    borderBottom: "1px solid #e8e0d6",
    marginBottom: "30px"
  },
  tabButton: {
    background: "transparent",
    color: "#777",
    border: "none",
    borderBottom: "3px solid transparent",
    padding: "15px 20px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600"
  },
  activeTab: { color: "#b8860b", borderBottom: "3px solid #b8860b" },

  section: { marginBottom: "40px" },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "25px"
  },
  sectionTitle: { fontSize: "28px", fontFamily: "serif", margin: "0 0 8px" },
  sectionDescription: { color: "#777", fontSize: "14px", lineHeight: "1.6", margin: 0 },

  primaryButton: {
    background: "#b8860b",
    color: "white",
    border: "none",
    padding: "13px 22px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600"
  },
  disabledButton: { opacity: 0.6, cursor: "not-allowed" },

  form: {
    background: "white",
    padding: "clamp(18px, 4vw, 30px)",
    borderRadius: "18px",
    border: "1px solid #eee",
    boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
    marginBottom: "30px"
  },
  formTitle: { fontSize: "23px", margin: "0 0 8px", fontFamily: "serif" },
  formDescription: { color: "#777", fontSize: "14px", marginBottom: "18px" },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "20px"
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    color: "#444",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "20px"
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    border: "1px solid #ddd",
    borderRadius: "9px",
    fontSize: "14px",
    outlineColor: "#b8860b",
    background: "#fff"
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    border: "1px solid #ddd",
    borderRadius: "9px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    outlineColor: "#b8860b"
  },

  facilitiesSection: { marginBottom: "28px" },
  subHeading: { fontSize: "17px", margin: "0 0 10px", color: "#333" },
  facilitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    color: "#555",
    fontSize: "14px",
    padding: "10px",
    border: "1px solid #eee",
    borderRadius: "9px"
  },

  imageSection: { marginBottom: "28px" },
  uploadBox: {
    minHeight: "140px",
    border: "2px dashed #d8cbb9",
    borderRadius: "14px",
    background: "#fcfaf7",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "9px",
    color: "#8a6a25",
    cursor: "pointer",
    textAlign: "center",
    padding: "20px"
  },
  uploadIcon: { fontSize: "30px" },
  uploadHint: { color: "#888", fontSize: "12px" },
  fileInput: { display: "none" },

  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
    gap: "14px",
    marginTop: "20px",
    marginBottom: "20px"
  },
  previewCard: { position: "relative", minWidth: 0 },
  previewImage: {
    width: "100%",
    height: "120px",
    objectFit: "cover",
    borderRadius: "10px"
  },
  removeImageButton: {
    position: "absolute",
    top: "6px",
    right: "6px",
    border: "none",
    borderRadius: "50%",
    width: "27px",
    height: "27px",
    background: "#fff",
    color: "#a94442",
    cursor: "pointer"
  },
  previewName: {
    fontSize: "11px",
    color: "#777",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  formActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center"
  },
  cancelButton: {
    background: "#fff",
    color: "#666",
    border: "1px solid #ddd",
    padding: "13px 22px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px"
  },

  emptyState: {
    textAlign: "center",
    background: "white",
    border: "1px dashed #d8cbb9",
    borderRadius: "18px",
    padding: "45px 25px"
  },
  emptyIcon: { fontSize: "45px", marginBottom: "15px" },
  emptyTitle: { fontSize: "23px", fontFamily: "serif", margin: "0 0 10px" },
  emptyText: {
    color: "#777",
    fontSize: "14px",
    lineHeight: "1.7",
    maxWidth: "420px",
    margin: "0 auto 22px"
  },

  sablahGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "22px"
  },
  sablahCard: {
    background: "white",
    border: "1px solid #eee",
    borderRadius: "18px",
    padding: "25px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
    overflowWrap: "anywhere"
  },
  propertyIcon: { fontSize: "35px", marginBottom: "15px" },
  cardImage: {
    width: "100%",
    height: "190px",
    objectFit: "cover",
    borderRadius: "12px",
    marginBottom: "15px"
  },
  propertyTitle: { fontSize: "22px", fontFamily: "serif", margin: "0 0 8px" },
  arabicName: { color: "#b8860b", fontSize: "17px", marginBottom: "18px" },
  propertyDetail: { color: "#666", fontSize: "14px", lineHeight: "1.7", margin: "8px 0" },
  propertyPrice: { color: "#b8860b", fontSize: "21px", fontWeight: "700", margin: "18px 0" },
  propertyDescription: { color: "#777", fontSize: "14px", lineHeight: "1.7", marginTop: "15px" },

  cardActions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "15px"
  },
  editButton: {
    background: "#b8860b",
    color: "#fff",
    border: "1px solid #b8860b",
    padding: "10px 15px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "13px"
  },
  deleteButton: {
    background: "#fff",
    color: "#a94442",
    border: "1px solid #e7c6c5",
    padding: "10px 15px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "13px"
  },
  approveButton: {
    background: "#287a45",
    color: "#fff",
    border: "1px solid #287a45",
    padding: "10px 15px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "13px"
  },
  statusBadge: {
    display: "inline-block",
    padding: "7px 13px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "capitalize",
    marginBottom: "15px"
  },
  bookingDivider: {
    border: "none",
    borderTop: "1px solid #eee",
    margin: "18px 0"
  },
  notesBox: {
    background: "#fcfaf7",
    padding: "12px",
    borderRadius: "9px",
    marginTop: "12px"
  },

  profileCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    background: "white",
    border: "1px solid #eee",
    borderRadius: "18px",
    padding: "25px",
    marginTop: "40px"
  },
  profileIcon: { fontSize: "28px", marginBottom: "10px" },
  profileTitle: { fontSize: "21px", fontFamily: "serif", margin: "0 0 8px" },
  profileText: { color: "#777", fontSize: "14px", lineHeight: "1.6", margin: 0 },
  profileLink: {
    color: "#b8860b",
    fontWeight: "600",
    textDecoration: "none",
    padding: "12px 18px",
    border: "1px solid #b8860b",
    borderRadius: "10px"
  },
  demoNotice: {
    color: "#888",
    textAlign: "center",
    fontSize: "12px",
    lineHeight: "1.6",
    marginTop: "30px"
  },
  errorMessage: {
    background: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f1b0b7",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "20px"
  },
  successMessage: {
    background: "#d4edda",
    color: "#155724",
    border: "1px solid #b1dfbb",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "20px"
  }
};
