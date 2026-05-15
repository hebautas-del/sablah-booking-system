export default function Footer() {
  return (
    <div style={styles.footer}>
      <div>
        <h3>🏛️ Sablah</h3>
        <p>Oman Booking System</p>
        <p>
          Powered by Oman Vision 2040 — empowering local SMEs and digital communities.
        </p>
        <p>© 2025 Sablah · Made in the Sultanate of Oman</p>
      </div>

      <div>
        <h4>Company</h4>
        <p>About</p>
        <p>Contact</p>
        <p>Partners</p>
      </div>

      <div>
        <h4>Legal</h4>
        <p>Privacy</p>
        <p>Terms</p>
        <p>Cookies</p>
      </div>
    </div>
  );
}

const styles = {
  footer: {
    marginTop: "50px",
    background: "#f5f5f5",
    padding: "30px",
    display: "flex",
    justifyContent: "space-around",
    borderTop: "1px solid #ddd"
  }
};
