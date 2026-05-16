import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/forgot-password", { email });

      alert("OTP sent to email");

      navigate("/reset-password", { state: { email } });

    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Forgot Password</h2>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <button style={styles.button}>Send OTP</button>
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
    width: "350px",
    padding: "30px",
    border: "1px solid #b8860b",
    borderRadius: "10px"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px"
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#b8860b",
    color: "#fff",
    border: "none"
  }
};