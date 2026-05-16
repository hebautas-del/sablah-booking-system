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

import AllVenues from "./pages/AllVenues";

import ProtectedRoute from "./components/ProtectedRoute";


import VerifyOtp from "./pages/VerifyOtp";


export default function App() {
  return (
    <BrowserRouter>

      {/* NAVBAR */}
      <Navbar />

      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PASSWORD */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* VENUES */}
        <Route
          path="/venues"
          element={
            <ProtectedRoute roleAllowed={["admin", "owner", "user"]}>
              <AllVenues />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute roleAllowed={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* OWNER */}
        <Route
          path="/owner-dashboard"
          element={
            <ProtectedRoute roleAllowed={["owner"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute roleAllowed={["admin", "owner", "user"]}>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        {/* ADMIN USERS */}
        <Route
          path="/admin-users"
          element={
            <ProtectedRoute roleAllowed={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>

      {/* FOOTER */}
      <Footer />

    </BrowserRouter>
  );
}