import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "user",
    name: "",
    email: "",
    password: "",
    confirm: "",
    dob: "",
    gender: "",
    wilayat: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // AGE CHECK
  const calculateAge = (dob) => {
    const birth = new Date(dob);
    const diff = Date.now() - birth.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  };

  // EMAIL CHECK
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // PASSWORD CHECK (supports @ # $ % & etc.)
  const isStrongPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDATIONS
    if (!formData.name) return alert("Username required");
    if (!formData.email) return alert("Email required");
    if (!formData.password) return alert("Password required");
    if (!formData.confirm) return alert("Confirm password required");
    if (!formData.dob) return alert("Date of birth required");
    if (!formData.gender) return alert("Gender required");
    if (!formData.wilayat) return alert("Wilayat required");

    if (!isValidEmail(formData.email)) {
      return alert("Invalid email format");
    }

    if (!isStrongPassword(formData.password)) {
      return alert(
        "Password must include uppercase, lowercase, number & special character"
      );
    }

    if (formData.password !== formData.confirm) {
      return alert("Passwords do not match");
    }

    if (calculateAge(formData.dob) < 18) {
      return alert("You must be 18+ to register");
    }

    try {
      // ✅ REMOVE confirm BEFORE sending
      const { confirm, ...dataToSend } = formData;

      const res = await API.post("/auth/register", dataToSend);

      console.log(res.data); // 🔥 DEBUG

      alert("Registered Successfully");
      navigate("/login");

    } catch (err) {
      console.log(err); // 🔥 IMPORTANT FOR DEBUG
      alert(err.response?.data?.message || "Server Error");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit} style={styles.form}>

          <select name="role" onChange={handleChange} style={styles.input}>
            <option value="user">User</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>

          <input name="name" placeholder="Full Name" onChange={handleChange} style={styles.input} />
          <input name="email" placeholder="Email" onChange={handleChange} style={styles.input} />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} style={styles.input} />
          <input type="password" name="confirm" placeholder="Confirm Password" onChange={handleChange} style={styles.input} />

          <label>Date of Birth</label>
          <input type="date" name="dob" onChange={handleChange} style={styles.input} />

          <select name="gender" onChange={handleChange} style={styles.input}>
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <select name="wilayat" onChange={handleChange} style={styles.input}>
            <option value="">Select Wilayat</option>
            <option value="Muscat">Muscat</option>
            <option value="Seeb">Seeb</option>
            <option value="Bowsher">Bowsher</option>
            <option value="Sohar">Sohar</option>
            <option value="Nizwa">Nizwa</option>
            <option value="Salalah">Salalah</option>
          </select>

          <button style={styles.button}>Register</button>

        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    width: "400px",
    padding: "20px",
    boxShadow: "0 0 10px #ccc"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  input: {
    padding: "10px"
  },
  button: {
    padding: "10px",
    background: "#b8860b",
    color: "#fff",
    border: "none"
  }
};