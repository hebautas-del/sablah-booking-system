
import { useEffect, useState } from "react";
import axios from "axios";

export default function EditProfile() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: localStorage.getItem("name") || "",
      email: localStorage.getItem("email") || "",
      phone: localStorage.getItem("phone") || ""
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Please enter your name and phone number.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:5000/api/users/update-profile",
        {
          name: formData.name.trim(),
          phone: formData.phone.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updatedUser = response.data.user;

      localStorage.setItem("name", updatedUser.name);
      localStorage.setItem("phone", updatedUser.phone);

      setFormData((prev) => ({
        ...prev,
        name: updatedUser.name,
        phone: updatedUser.phone
      }));

      window.dispatchEvent(new Event("authchange"));

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Edit Profile</h1>

        <p style={styles.subtitle}>
          Update your personal account information.
        </p>

        <form onSubmit={handleUpdate} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              style={styles.readOnlyInput}
            />

            <small style={styles.note}>
              Email address cannot be changed.
            </small>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Phone Number</label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f8f5f1",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "120px 20px 50px"
  },

  card: {
    width: "100%",
    maxWidth: "500px",
    background: "white",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)"
  },

  title: {
    fontSize: "32px",
    marginBottom: "10px",
    color: "#b8860b",
    textAlign: "center",
    fontFamily: "serif"
  },

  subtitle: {
    color: "#777",
    textAlign: "center",
    fontSize: "14px",
    marginBottom: "30px"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },

  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#444"
  },

  input: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "15px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box"
  },

  readOnlyInput: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "15px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    background: "#f3f3f3",
    color: "#777",
    cursor: "not-allowed"
  },

  note: {
    color: "#888",
    fontSize: "12px"
  },

  button: {
    background: "#b8860b",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "16px",
    marginTop: "5px"
  }
};
