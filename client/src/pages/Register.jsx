import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "user",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",

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
    amenities: "",

    image: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const isStrongPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) return alert("Username required");
    if (!formData.email) return alert("Email required");
    if (!formData.password) return alert("Password required");
    if (!formData.confirm) return alert("Confirm password required");

    if (!isValidEmail(formData.email))
      return alert("Invalid email format");

    if (!isStrongPassword(formData.password))
      return alert("Password must include uppercase, lowercase, number & special character");

    if (formData.password !== formData.confirm)
      return alert("Passwords do not match");

    try {
      const { confirm, ...dataToSend } = formData;

      await API.post("/auth/register", dataToSend);

      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  const roleBtn = (role) => ({
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: formData.role === role ? "2px solid #c89b3c" : "1px solid #ddd",
    background: formData.role === role ? "#fff7e6" : "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    color: formData.role === role ? "#c89b3c" : "#555",
  });

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f1eb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#fff",
          padding: "25px",
          borderRadius: "15px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "5px", color: "#c89b3c" }}>
          GET STARTED
        </h2>

        <h1 style={{ marginBottom: "20px" }}>Create Account</h1>

        <form onSubmit={handleSubmit}>
          {/* ROLE */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <button type="button" style={roleBtn("user")} onClick={() => setFormData({ ...formData, role: "user" })}>
              Guest
            </button>

            <button type="button" style={roleBtn("owner")} onClick={() => setFormData({ ...formData, role: "owner" })}>
              Owner
            </button>

            <button type="button" style={roleBtn("admin")} onClick={() => setFormData({ ...formData, role: "admin" })}>
              Admin
            </button>
          </div>

          {/* BASIC FIELDS */}
          <input style={inputStyle} name="name" placeholder="Full Name" onChange={handleChange} />
          <input style={inputStyle} name="email" placeholder="Email" onChange={handleChange} />
          <input style={inputStyle} name="phone" placeholder="Phone" onChange={handleChange} />

          <div style={{ display: "flex", gap: "10px" }}>
            <input style={inputStyle} type="password" name="password" placeholder="Password" onChange={handleChange} />
            <input style={inputStyle} type="password" name="confirm" placeholder="Confirm" onChange={handleChange} />
          </div>

          {/* USER FIELDS (HIDDEN FOR OWNER ONLY) */}
          {formData.role !== "owner" && (
            <>
              <input style={inputStyle} type="date" name="dob" onChange={handleChange} />

              <select style={inputStyle} name="gender" onChange={handleChange}>
                <option value="">Gender</option>
                <option>male</option>
                <option>female</option>
              </select>

              <select style={inputStyle} name="wilayat" onChange={handleChange}>
                <option value="">Wilayat</option>
                <option>Muscat</option>
                <option>Seeb</option>
                <option>Bowsher</option>
                <option>Sohar</option>
                <option>Nizwa</option>
                <option>Salalah</option>
              </select>
              <input
                style={inputStyle}
                type="file"
                accept="image/*"
                name="image"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    image: e.target.files[0]
                  })
                }
/>
            </>
          )}

          {/* OWNER SECTION */}
          {formData.role === "owner" && (
            <div style={{ marginTop: "10px" }}>
              <input style={inputStyle} name="businessName" placeholder="Business Name" onChange={handleChange} />
              <input style={inputStyle} name="sablahNameEn" placeholder="Sablah EN" onChange={handleChange} />
              <input style={inputStyle} name="sablahNameAr" placeholder="Sablah AR" onChange={handleChange} />
              <input style={inputStyle} name="area" placeholder="Area" onChange={handleChange} />
              <input style={inputStyle} name="capacity" placeholder="Capacity" onChange={handleChange} />
              <input style={inputStyle} name="price" placeholder="Price" onChange={handleChange} />
              <input style={inputStyle} name="address" placeholder="Address" onChange={handleChange} />
              <input style={inputStyle} name="descriptionEn" placeholder="Description EN" onChange={handleChange} />
              <input style={inputStyle} name="descriptionAr" placeholder="Description AR" onChange={handleChange} />
              <input style={inputStyle} name="amenities" placeholder="Amenities" onChange={handleChange} />
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#c89b3c",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}