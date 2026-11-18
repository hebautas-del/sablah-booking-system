
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminSablahs from "./pages/AdminSablahs";

import OwnerDashboard from "./pages/OwnerDashboard";
import EditProfile from "./pages/EditProfile";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyOtp from "./pages/VerifyOtp";

import Venues from "./pages/AllVenues";
import VenueDetails from "./pages/VenueDetails";
import Book from "./pages/Book";
import MyBookings from "./pages/MyBookings";
import Notifications from "./pages/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* All Venues */}
        <Route
          path="/venues"
          element={
            <ProtectedRoute roleAllowed={["admin", "owner", "user"]}>
              <Venues />
            </ProtectedRoute>
          }
        />

        {/* Venue Details */}
        <Route
          path="/venue/:id"
          element={
            <ProtectedRoute roleAllowed={["admin", "owner", "user"]}>
              <VenueDetails />
            </ProtectedRoute>
          }
        />

        {/* Booking */}
        <Route
          path="/book"
          element={
            <ProtectedRoute roleAllowed={["user"]}>
              <Book />
            </ProtectedRoute>
          }
        />

        {/* User My Bookings */}
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute roleAllowed={["user"]}>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* Notifications - User and Owner */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute roleAllowed={["user", "owner"]}>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute roleAllowed={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Users Management */}
        <Route
          path="/admin-users"
          element={
            <ProtectedRoute roleAllowed={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        {/* Admin Sablah Management */}
        <Route
          path="/admin-sablahs"
          element={
            <ProtectedRoute roleAllowed={["admin"]}>
              <AdminSablahs />
            </ProtectedRoute>
          }
        />

        {/* Owner Dashboard */}
        <Route
          path="/owner-dashboard"
          element={
            <ProtectedRoute roleAllowed={["owner"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute roleAllowed={["admin", "owner", "user"]}>
              <EditProfile />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}
