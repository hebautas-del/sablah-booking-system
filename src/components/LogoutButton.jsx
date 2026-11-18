import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <button onClick={logout} style={{ padding: "8px 12px" }}>
      Logout
    </button>
  );
}
