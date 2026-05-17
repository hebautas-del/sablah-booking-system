import { useEffect, useState } from "react";
import axios from "axios";

export default function EditProfile() {
  const [role, setRole] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",

    // USER FIELDS
    dob: "",
    gender: "",
    wilayat: "",

    // OWNER FIELDS
    businessName: "",
    sablahNameEn: "",
    sablahNameAr: "",
    area: "",
    capacity: "",
    price: "",
    address: "",
    descriptionEn: "",
    descriptionAr: "",
    amenities: ""
  });

  useEffect(() => {
    setFormData({
      name: localStorage.getItem("name") || "",
      email: localStorage.getItem("email") || "",
      phone: localStorage.getItem("phone") || "",
      password: "",

      dob: "",
      gender: "",
      wilayat: "",

      businessName: "",
      sablahNameEn: "",
      sablahNameAr: "",
      area: "",
      capacity: "",
      price: "",
      address: "",
      descriptionEn: "",
      descriptionAr: "",
      amenities: ""
    });

    setRole(localStorage.getItem("role") || "user");
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:5000/api/users/update-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Profile updated successfully");

      localStorage.setItem("name", response.data.user.name);
      localStorage.setItem("phone", response.data.user.phone);

    } catch (error) {
      console.log(error);
      alert("Failed to update profile");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Edit Profile</h1>

        <form onSubmit={handleUpdate} style={styles.form}>

          {/* BASIC INFO */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
          />

          {/* ❌ EMAIL (READ ONLY) */}
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
            style={{ ...styles.input, background: "#f3f3f3", cursor: "not-allowed" }}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="New Password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
          />

          {/* USER FIELDS */}
          {role === "user" && (
            <>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                style={styles.input}
              />

              <input
                type="text"
                name="gender"
                placeholder="Gender"
                value={formData.gender}
                onChange={handleChange}
                style={styles.input}
              />

              <input
                type="text"
                name="wilayat"
                placeholder="Wilayat"
                value={formData.wilayat}
                onChange={handleChange}
                style={styles.input}
              />
            </>
          )}

          {/* OWNER FIELDS */}
          {role === "owner" && (
            <>
              <input
                type="text"
                name="businessName"
                placeholder="Business Name"
                value={formData.businessName}
                onChange={handleChange}
                style={styles.input}
              />

              <input
                type="text"
                name="sablahNameEn"
                placeholder="Sablah Name (EN)"
                value={formData.sablahNameEn}
                onChange={handleChange}
                style={styles.input}
              />

              <input
                type="text"
                name="sablahNameAr"
                placeholder="Sablah Name (AR)"
                value={formData.sablahNameAr}
                onChange={handleChange}
                style={styles.input}
              />

              <input
                type="text"
                name="area"
                placeholder="Area"
                value={formData.area}
                onChange={handleChange}
                style={styles.input}
              />

              <input
                type="text"
                name="capacity"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={handleChange}
                style={styles.input}
              />

              <input
                type="text"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                style={styles.input}
              />

              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                style={styles.input}
              />

              <input
                type="text"
                name="descriptionEn"
                placeholder="Description (EN)"
                value={formData.descriptionEn}
                onChange={handleChange}
                style={styles.input}
              />

              <input
                type="text"
                name="descriptionAr"
                placeholder="Description (AR)"
                value={formData.descriptionAr}
                onChange={handleChange}
                style={styles.input}
              />

              <input
                type="text"
                name="amenities"
                placeholder="Amenities"
                value={formData.amenities}
                onChange={handleChange}
                style={styles.input}
              />
            </>
          )}

          <button type="submit" style={styles.button}>
            Save Changes
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
    paddingTop: "100px"
  },

  card: {
    width: "500px",
    background: "white",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)"
  },

  title: {
    fontSize: "32px",
    marginBottom: "30px",
    color: "#b8860b",
    textAlign: "center",
    fontFamily: "serif"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },

  input: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "15px",
    outline: "none"
  },

  button: {
    background: "#b8860b",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px"
  }
};