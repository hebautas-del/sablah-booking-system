import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roleAllowed }) {

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (!roleAllowed.includes(role)) {
    return <Navigate to="/home" />;
  }

  return children;
}