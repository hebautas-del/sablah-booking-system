import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/reset-password", {
        email,
        otp,
        newPassword
      });

      alert("Password reset successful");

      navigate("/login");

    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Reset Password</h2>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
          />

          <button style={styles.button}>Reset Password</button>
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