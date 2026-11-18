
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roleAllowed }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // User is not logged in
  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  // Check user permissions
  if (!roleAllowed.includes(role)) {
    if (role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }

    if (role === "owner") {
      return <Navigate to="/owner-dashboard" replace />;
    }

    if (role === "user") {
      return <Navigate to="/home" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}
