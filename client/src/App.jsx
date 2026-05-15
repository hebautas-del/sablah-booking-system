import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Owner from "./pages/Owner";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <div style={{ paddingTop: "70px" }}>

        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/admin" element={
            <ProtectedRoute roleAllowed={["admin"]}>
              <Admin />
            </ProtectedRoute>
          } />

          <Route path="/owner" element={
            <ProtectedRoute roleAllowed={["owner"]}>
              <Owner />
            </ProtectedRoute>
          } />

        </Routes>

      </div>

      <Footer />

    </BrowserRouter>
  );
}