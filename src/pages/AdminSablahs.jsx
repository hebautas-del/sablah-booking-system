
import { useEffect, useState } from "react";
import API from "../api";

export default function AdminSablahs() {
  const [sablahs, setSablahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Retrieve all sablah listings from the backend.
  const fetchSablahs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/sablahs");
      setSablahs(res.data);
      setError("");
    } catch (err) {
      console.error("Fetch Sablahs Error:", err);
      setError("Failed to load sablahs.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a selected sablah after admin confirmation.
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sablah?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/admin/sablahs/${id}`);
      fetchSablahs();
    } catch (err) {
      console.error("Delete Sablah Error:", err);
      alert("Failed to delete sablah.");
    }
  };

  // Load sablahs when the page opens.
  useEffect(() => {
    fetchSablahs();
  }, []);

  return (
    <div style={styles.container}>
      <h1>Sablah Management</h1>
      <p>View and manage all registered sablah listings.</p>

      {loading && <p>Loading sablahs...</p>}

      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && sablahs.length === 0 && (
        <p>No sablahs found.</p>
      )}

      {!loading && sablahs.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name (English)</th>
                <th>Name (Arabic)</th>
                <th>Area</th>
                <th>Capacity</th>
                <th>Price</th>
                <th>Owner</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {sablahs.map((s) => (
                <tr key={s._id}>
                  <td>{s.nameEn}</td>
                  <td>{s.nameAr}</td>
                  <td>{s.area}</td>
                  <td>{s.capacity}</td>
                  <td>{s.price}</td>
                  <td>{s.owner?.name || "Unknown"}</td>
                  <td>
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDelete(s._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Page styling.
const styles = {
  container: {
    padding: "40px",
    minHeight: "100vh",
    background: "#f8f5f1"
  },
  tableWrapper: {
    overflowX: "auto",
    marginTop: "25px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "white"
  },
  error: {
    color: "red"
  },
  deleteButton: {
    background: "#c0392b",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer"
  }
};
