import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "owner") {
          navigate("/owner-dashboard");
        } else if (res.data.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/home");
        }

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">

      <style>{`
        .login-page {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fdfaf3;
          font-family: Arial;
        }

        .login-card {
          background-color: #fdfaf3;
          border: 1px solid #b8860b;
          border-radius: 12px;
          padding: 30px;
          width: 350px;
          box-shadow: 0 4px 8px rgba(184, 134, 11, 0.2);
          text-align: center;
          transition: transform 0.2s ease-in-out;
        }

        .login-card:hover {
          transform: translateY(-5px);
        }

        .title {
          color: #b8860b;
          font-size: 1.6rem;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .subtitle {
          color: #333;
          font-size: 0.95rem;
          margin-bottom: 20px;
        }

        .input {
          width: 100%;
          padding: 10px;
          margin-bottom: 12px;
          border-radius: 8px;
          border: 1px solid #b8860b;
          outline: none;
        }

        .button {
          width: 100%;
          background-color: #F0BF4C;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .button:hover {
          background-color: #b8860b;
        }

        .link {
          margin-top: 10px;
          display: block;
          color: #b8860b;
          text-decoration: none;
          font-size: 0.9rem;
        }
      `}</style>

      <div className="login-card">

        <div className="title">Sablah Login</div>
        <div className="subtitle">Welcome back to your booking system</div>

        <form onSubmit={handleSubmit}>

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="input"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="input"
          />

          <button className="button">Login</button>

        </form>

        <Link to="/forgot-password" className="link">
          Forgot Password?
        </Link>

        <Link to="/register" className="link">
          Create new account
        </Link>

      </div>
    </div>
  );
}