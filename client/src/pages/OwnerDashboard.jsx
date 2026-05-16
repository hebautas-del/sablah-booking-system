export default function OwnerDashboard() {
  const name = localStorage.getItem("name");

  return (
    <div style={{ padding: "40px" }}>
      <h1>Owner Dashboard</h1>

      <p>Welcome Owner: {name}</p>

      <hr />

      <h3>Your Properties</h3>

      <ul>
        <li>Add Sablah</li>
        <li>View Bookings</li>
        <li>Manage Calendar</li>
      </ul>
    </div>
  );
}