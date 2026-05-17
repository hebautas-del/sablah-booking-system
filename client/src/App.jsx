import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";

import EditProfile from "./pages/EditProfile";
import AdminUsers from "./pages/AdminUsers";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Venues from "./pages/AllVenues"; // ✅ FIXED (was AllVenues)
import ProtectedRoute from "./components/ProtectedRoute";

import VerifyOtp from "./pages/VerifyOtp";

export default function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ✅ VENUES (main after login) */}
        <Route
          path="/venues"
          element={
            <ProtectedRoute roleAllowed={["admin", "owner", "user"]}>
              <Venues />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute roleAllowed={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner-dashboard"
          element={
            <ProtectedRoute roleAllowed={["owner"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute roleAllowed={["admin", "owner", "user"]}>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-users"
          element={
            <ProtectedRoute roleAllowed={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route path="/verify-otp" element={<VerifyOtp />} />

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}