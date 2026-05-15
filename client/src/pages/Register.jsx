import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "user",   // default Guest
    name: "",
    business: "",
    email: "",
    phone: "",
    password: "",
    confirm: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      await API.post("/auth/register", formData);
      alert("Registered Successfully");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Register Failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>GET STARTED</h2>
        <h1 style={styles.heading}>Create your account</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Role selection styled like prototype */}
          <div style={styles.roleBox}>
            <div
              style={{
                ...styles.roleOption,
                border: formData.role === "user" ? "2px solid #b8860b" : "1px solid #ddd"
              }}
              onClick={() => setFormData({ ...formData, role: "user" })}
            >
              Guest / Customer
            </div>
            <div
              style={{
                ...styles.roleOption,
                border: formData.role === "owner" ? "2px solid #b8860b" : "1px solid #ddd"
              }}
              onClick={() => setFormData({ ...formData, role: "owner" })}
            >
              Sablah Owner / Host
            </div>
          </div>

          {/* Full Name */}
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            style={styles.input}
          />

          {/* Business Name (only if owner) */}
          {formData.role === "owner" && (
            <input
              name="business"
              placeholder="Business Name"
              onChange={handleChange}
              style={styles.input}
            />
          )}

          {/* Email */}
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            style={styles.input}
          />

          {/* Phone (optional) */}
          <input
            name="phone"
            placeholder="Phone (optional)"
            onChange={handleChange}
            style={styles.input}
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            style={styles.input}
          />

          {/* Confirm Password */}
          <input
            type="password"
            name="confirm"
            placeholder="Confirm Password"
            onChange={handleChange}
            style={styles.input}
          />

          <button style={styles.button}>Create Account</button>
        </form>

        <p style={styles.text}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(240, 191, 76, 0.1)" // ✅ lighter golden background
  },
  card: {
    width: "400px",
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },
  title: {
    textAlign: "center",
    marginBottom: "5px",
    color: "#666",
    fontSize: "14px"
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#b8860b"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  roleBox: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px"
  },
  roleOption: {
    flex: 1,
    textAlign: "center",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    margin: "0 5px",
    background: "#fff",
    fontSize: "14px"
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none"
  },
  button: {
    padding: "12px",
    background: "#b8860b",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  text: {
    textAlign: "center",
    marginTop: "15px",
    fontSize: "14px"
  },
  link: {
    color: "#b8860b",
    textDecoration: "none"
  }
};
