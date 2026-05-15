import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/forgot-password", { email });

      setToken(res.data.token);

      alert("Reset token generated!");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>ACCOUNT RECOVERY</h2>

        <p style={styles.subtitle}>
          Enter your email to receive reset token
        </p>

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button style={styles.button}>Send</button>
        </form>

        {token && (
          <div style={styles.tokenBox}>
            <p>Reset Token:</p>
            <b>{token}</b>

            <button
              style={styles.smallBtn}
              onClick={() => navigate("/reset-password")}
            >
              Go to Reset Password
            </button>
          </div>
        )}
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
    background: "#fdfaf3"
  },
  card: {
    width: "350px",
    padding: "30px",
    border: "1px solid #b8860b",
    borderRadius: "12px",
    background: "#fff"
  },
  title: {
    color: "#b8860b",
    textAlign: "center"
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "20px"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px"
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#F0BF4C",
    border: "none",
    color: "#fff"
  },
  tokenBox: {
    marginTop: "15px",
    padding: "10px",
    border: "1px dashed #b8860b"
  },
  smallBtn: {
    marginTop: "10px",
    padding: "8px",
    background: "#b8860b",
    color: "#fff",
    border: "none",
    width: "100%"
  }
};