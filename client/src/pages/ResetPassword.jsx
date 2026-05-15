import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

export default function ResetPassword() {

  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await API.put(`/auth/reset-password/${token}`, {
        password
      });

      alert("Password reset successful");

      navigate("/login");

    } catch (err) {

      alert(
        err.response?.data?.message || "Reset failed"
      );

    }
  };

  return (
    <div style={styles.container}>

      <div style={styles.card}>

        <h1 style={styles.title}>Reset Password</h1>

        <form onSubmit={handleSubmit} style={styles.form}>

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button}>
            Reset Password
          </button>

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
    alignItems: "center",
    background: "#F0BF4C"
  },

  card: {
    width: "350px",
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#b8860b"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd"
  },

  button: {
    padding: "12px",
    background: "#b8860b",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }

};