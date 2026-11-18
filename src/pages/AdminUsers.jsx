
import { useEffect, useMemo, useState } from "react";
import API from "../api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get("/admin/users");

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.users || [];

        setUsers(data);
      } catch (err) {
        console.error("Fetch users error:", err);
        setError(
          err.response?.data?.message ||
          "Unable to load users. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Statistics
  const totalUsers = users.length;
  const regularUsers = users.filter(u => u.role === "user").length;
  const owners = users.filter(u => u.role === "owner").length;
  const admins = users.filter(u => u.role === "admin").length;

  // Search and filter
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        (user.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        selectedRole === "all" || user.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [users, search, selectedRole]);

  const getInitials = (name) => {
    if (!name) return "?";

    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map(word => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="admin-users-page">
      <style>{`
        .admin-users-page {
          min-height: 65vh;
          padding: 35px 4%;
          background: #f7f6f2;
          color: #263d38;
          font-family: inherit;
        }

        .users-container {
          max-width: 1450px;
          margin: auto;
        }

        .users-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .users-title {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .users-title-icon {
          width: 55px;
          height: 55px;
          border-radius: 16px;
          background: #e3ede8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 27px;
        }

        .users-title h2 {
          margin: 0 0 6px;
          font-size: 27px;
          color: #294d43;
        }

        .users-title p {
          margin: 0;
          color: #78827e;
          font-size: 14px;
        }

        .users-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(130px, 1fr));
          gap: 14px;
          margin-bottom: 25px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e9e8e1;
          border-radius: 15px;
          padding: 19px;
          box-shadow: 0 3px 12px rgba(40, 60, 50, 0.035);
        }

        .stat-label {
          font-size: 13px;
          color: #7b8580;
          margin-bottom: 9px;
        }

        .stat-number {
          font-size: 27px;
          font-weight: 700;
          color: #294d43;
        }

        .users-card {
          background: white;
          border: 1px solid #e9e8e1;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 4px 18px rgba(40, 60, 50, 0.04);
        }

        .users-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .users-search {
          flex: 1;
          min-width: 220px;
          max-width: 470px;
          position: relative;
        }

        .users-search input {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 16px 13px 42px;
          border: 1px solid #dfe4df;
          border-radius: 11px;
          outline: none;
          font-size: 14px;
          background: #fcfcfa;
          color: #263d38;
        }

        .users-search input:focus {
          border-color: #527c6d;
          box-shadow: 0 0 0 3px rgba(82, 124, 109, 0.10);
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 11px;
          font-size: 17px;
        }

        .users-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-button {
          padding: 10px 17px;
          border: 1px solid #e1e5df;
          border-radius: 9px;
          background: #fff;
          color: #53645d;
          cursor: pointer;
          font-size: 13px;
          transition: 0.2s;
        }

        .filter-button:hover {
          background: #edf3ef;
        }

        .filter-button.active {
          background: #315c4e;
          color: white;
          border-color: #315c4e;
        }

        .users-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 650px;
          text-align: left;
        }

        .users-table th {
          background: #f1f4f0;
          color: #53645d;
          padding: 15px 16px;
          font-size: 13px;
          font-weight: 600;
        }

        .users-table th:first-child {
          border-radius: 9px 0 0 9px;
        }

        .users-table th:last-child {
          border-radius: 0 9px 9px 0;
        }

        .users-table td {
          padding: 15px 16px;
          border-bottom: 1px solid #edf0eb;
          font-size: 14px;
          color: #45544e;
        }

        .users-table tbody tr:hover {
          background: #fafbf9;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          color: #29433b;
        }

        .user-avatar {
          width: 37px;
          height: 37px;
          min-width: 37px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #e4ece7;
          color: #315c4e;
          font-size: 12px;
          font-weight: 700;
        }

        .role-badge {
          display: inline-block;
          padding: 6px 13px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .role-user {
          background: #e5f0fa;
          color: #28639b;
        }

        .role-owner {
          background: #e2f0e8;
          color: #28724d;
        }

        .role-admin {
          background: #f0e8fa;
          color: #7547a4;
        }

        .users-count {
          color: #7a8580;
          font-size: 13px;
          margin-top: 18px;
        }

        .users-message {
          text-align: center;
          padding: 55px 15px;
          color: #7b8580;
          font-size: 14px;
        }

        .users-error {
          background: #fff0ef;
          color: #a33b35;
          padding: 16px;
          border-radius: 10px;
          margin-bottom: 18px;
        }

        @media (max-width: 850px) {
          .users-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .users-card {
            padding: 16px;
          }
        }

        @media (max-width: 520px) {
          .admin-users-page {
            padding: 22px 12px;
          }

          .users-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 9px;
          }

          .stat-card {
            padding: 14px;
          }

          .users-title h2 {
            font-size: 22px;
          }

          .users-toolbar {
            align-items: stretch;
          }

          .users-search {
            max-width: none;
          }
        }
      `}</style>

      <div className="users-container">

        {/* Header */}
        <div className="users-header">
          <div className="users-title">
            <div className="users-title-icon">👥</div>
            <div>
              <h2>Users Management</h2>
              <p>View and manage all registered users and owners.</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="users-stats">
          <div className="stat-card">
            <div className="stat-label">Total Accounts</div>
            <div className="stat-number">{totalUsers}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Regular Users</div>
            <div className="stat-number">{regularUsers}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Sablah Owners</div>
            <div className="stat-number">{owners}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Administrators</div>
            <div className="stat-number">{admins}</div>
          </div>
        </div>

        {/* Main Card */}
        <div className="users-card">

          {/* Search and Filters */}
          <div className="users-toolbar">

            <div className="users-search">
              <span className="search-icon">⌕</span>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="users-filters">
              {[
                { value: "all", label: "All" },
                { value: "user", label: "Users" },
                { value: "owner", label: "Owners" },
                { value: "admin", label: "Admins" }
              ].map(filter => (
                <button
                  key={filter.value}
                  className={`filter-button ${
                    selectedRole === filter.value ? "active" : ""
                  }`}
                  onClick={() => setSelectedRole(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="users-error">
              {error}
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="users-message">
              Loading users...
            </div>
          ) : error ? null : filteredUsers.length === 0 ? (
            <div className="users-message">
              <div style={{ fontSize: "35px", marginBottom: "10px" }}>
                🔍
              </div>
              No users found.
            </div>
          ) : (
            <>
              <div className="users-table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr key={user._id || user.id || index}>
                        <td>
                          <div className="user-info">
                            <div className="user-avatar">
                              {getInitials(user.name)}
                            </div>
                            <span>{user.name || "Unnamed User"}</span>
                          </div>
                        </td>

                        <td>{user.email || "No email"}</td>

                        <td>
                          <span
                            className={`role-badge role-${user.role}`}
                          >
                            {user.role || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="users-count">
                Showing {filteredUsers.length} of {totalUsers} accounts
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
