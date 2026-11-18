import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api";

export default function VerifyOtp() {
  const { state } = useLocation();
  const email = state?.email;

  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      await API.post("/api/auth/verify-otp", {
        email,
        otp
      });

      alert("OTP verified");

      navigate("/reset-password", { state: { email } });

    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Verify OTP</h2>

        <form onSubmit={handleVerify}>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={styles.input}
          />

          <button style={styles.button}>Verify</button>
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
    borderRadius: "12px"
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