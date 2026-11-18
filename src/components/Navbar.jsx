
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import logo from "../assets/logo.png";

/* ---------- THEME TOKENS ---------- */
const themes = {
  light: {
    bg: "#faf7f2",
    surface: "rgba(250,247,242,0.92)",
    text: "#6b5d4f",
    heading: "#3b2f22",
    gold: "#c9a24a",
    goldDark: "#b8860b",
    border: "#ece4d6",
  },
  dark: {
    bg: "#1b1611",
    surface: "rgba(27,22,17,0.92)",
    text: "#c9bba7",
    heading: "#f1e7d6",
    gold: "#d9b25c",
    goldDark: "#b8860b",
    border: "#3a3026",
  },
};

/* ---------- FONT AND CSS ---------- */
const fontCss = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

.sb-link:hover {
  color: var(--sb-gold) !important;
}

.sb-btn {
  transition: transform .15s ease, box-shadow .15s ease;
}

.sb-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(184,134,11,.35);
}

.sb-icon:hover {
  color: var(--sb-gold) !important;
}

.sb-btn:focus-visible,
.sb-icon:focus-visible {
  outline: 2px solid var(--sb-gold);
  outline-offset: 3px;
}

@media (max-width: 760px) {
  .sb-nav-links {
    display: none !important;
  }
}
`;

/* ---------- ICONS ---------- */
const Moon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

const Sun = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const Bell = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M10 21h4" />
  </svg>
);

/* ---------- NAVBAR ---------- */
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t: translate, i18n } = useTranslation();

  const [mode, setMode] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || i18n.language || "en"
  );

  const [role, setRole] = useState(
    () => localStorage.getItem("role") || ""
  );

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem("token"))
  );

  const [unreadCount, setUnreadCount] = useState(0);

  const isArabic = language.startsWith("ar");
  const t = themes[mode] || themes.light;

  /* ---------- AUTH STATE ---------- */
  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem("token");
      const savedRole = localStorage.getItem("role") || "";

      setRole(savedRole);
      setIsLoggedIn(Boolean(token));
    };

    syncAuth();

    window.addEventListener("storage", syncAuth);
    window.addEventListener("authchange", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("authchange", syncAuth);
    };
  }, [location.pathname, location.search]);

  /* ---------- THEME ---------- */
  useEffect(() => {
    document.body.classList.toggle("dark-mode", mode === "dark");

    const syncTheme = () => {
      setMode(localStorage.getItem("theme") === "dark" ? "dark" : "light");
    };

    window.addEventListener("storage", syncTheme);
    window.addEventListener("themechange", syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("themechange", syncTheme);
    };
  }, [mode]);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";

    localStorage.setItem("theme", newMode);
    setMode(newMode);

    document.body.classList.toggle("dark-mode", newMode === "dark");
    window.dispatchEvent(new Event("themechange"));
  };

  /* ---------- LANGUAGE ---------- */
  useEffect(() => {
    const updateDirection = (lang) => {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang.startsWith("ar") ? "rtl" : "ltr";
    };

    updateDirection(language);
  }, [language]);

  const toggleLanguage = async () => {
    const newLanguage = isArabic ? "en" : "ar";

    await i18n.changeLanguage(newLanguage);

    localStorage.setItem("language", newLanguage);
    setLanguage(newLanguage);

    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";

    window.dispatchEvent(new Event("languagechange"));
  };

  /* ---------- NOTIFICATIONS ---------- */
  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");

    if (!token || !["user", "owner"].includes(savedRole)) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:5000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const count = response.data.filter(
        (notification) => !notification.isRead
      ).length;

      setUnreadCount(count);

    } catch (error) {
      console.error("Fetch Unread Notifications Error:", error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    const handleNotificationsUpdate = () => {
      fetchUnreadCount();
    };

    window.addEventListener(
      "notificationschange",
      handleNotificationsUpdate
    );

    return () => {
      window.removeEventListener(
        "notificationschange",
        handleNotificationsUpdate
      );
    };
  }, [fetchUnreadCount, location.pathname, location.search, isLoggedIn, role]);

  /* ---------- ROLE NAVIGATION ---------- */
  const roleItems = {
    admin: [
      { label: "Dashboard", to: "/admin-dashboard" },
      { label: "Users", to: "/admin-users" },
      { label: "Sablahs", to: "/admin-sablahs" },
      { label: "Bookings", to: "/admin-dashboard" },
      { label: "Feedback", to: "/admin-dashboard" },
      { label: "Profile", to: "/edit-profile" },
    ],

    owner: [
      { label: "Dashboard", to: "/owner-dashboard" },
      { label: "My Sablahs", to: "/owner-dashboard?tab=sablahs" },
      { label: "Bookings", to: "/owner-dashboard?tab=bookings" },
      { label: "Profile", to: "/edit-profile" },
    ],

    user: [
      { label: "Home", to: "/" },
      { label: "Search", to: "/search" },
      { label: "Venues", to: "/venues" },
      { label: "My Bookings", to: "/my-bookings" },
      { label: "Profile", to: "/edit-profile" },
    ],

    guest: [
      { label: "Home", to: "/" },
    ],
  };

  const currentRole =
    isLoggedIn && roleItems[role] ? role : "guest";

  const navItems = roleItems[currentRole];

  const showNotifications =
    isLoggedIn && ["user", "owner"].includes(role);

  /* ---------- LOGOUT ---------- */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("phone");

    setRole("");
    setIsLoggedIn(false);
    setUnreadCount(0);

    window.dispatchEvent(new Event("authchange"));

    navigate("/");
  };

  /* ---------- STYLES ---------- */
  const s = {
    nav: {
      position: "sticky",
      top: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
      padding: "10px 16px",
      background: t.surface,
      backdropFilter: "blur(8px)",
      borderBottom: `1px solid ${t.border}`,
      fontFamily: isArabic
        ? "Tahoma, Arial, sans-serif"
        : "'Inter', system-ui, sans-serif",
    },

    brand: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      textDecoration: "none",
      flexShrink: 0,
    },

    brandMark: {
      width: 42,
      height: 42,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },

    brandName: {
      display: "block",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontWeight: 600,
      fontSize: 17,
      color: t.gold,
      lineHeight: 1.1,
    },

    brandTag: {
      display: "block",
      fontSize: 10,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: t.text,
    },

    navLinks: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 22,
      flexWrap: "wrap",
    },

    navLink: {
      textDecoration: "none",
      fontSize: 13,
      fontWeight: 500,
      color: t.text,
      transition: "color .2s",
    },

    navActions: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexShrink: 0,
    },

    iconBtn: {
      background: "transparent",
      border: "none",
      color: t.heading,
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600,
      padding: 8,
      borderRadius: 8,
    },

    notificationBtn: {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: "transparent",
      border: "none",
      color: t.heading,
      cursor: "pointer",
      padding: 8,
      borderRadius: 8,
    },

    notificationBadge: {
      position: "absolute",
      top: 0,
      right: 0,
      minWidth: 17,
      height: 17,
      padding: "0 4px",
      borderRadius: 20,
      background: "#c0392b",
      color: "#fff",
      fontSize: 10,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    signIn: {
      padding: "8px 16px",
      border: "none",
      borderRadius: 10,
      color: "#fff",
      fontWeight: 600,
      fontSize: 13,
      cursor: "pointer",
      background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`,
    },

    register: {
      padding: "8px 16px",
      border: `1px solid ${t.gold}`,
      borderRadius: 10,
      color: t.goldDark,
      fontWeight: 600,
      fontSize: 13,
      cursor: "pointer",
      background: "transparent",
    },
  };

  return (
    <>
      <style>{fontCss}</style>

      <header style={{ ...s.nav, "--sb-gold": t.gold }}>
        <Link to="/" style={s.brand}>
          <span style={s.brandMark}>
            <img
              src={logo}
              alt="Sablah logo"
              style={{
                width: 50,
                height: 50,
                objectFit: "contain",
                display: "block",
              }}
            />
          </span>

          <span>
            <span style={s.brandName}>
              {isArabic ? "سبلة" : "Sablah"}
            </span>

            <span style={s.brandTag}>
              {isArabic ? "حجز السبلات" : "Sablah Booking"}
            </span>
          </span>
        </Link>

        <nav
          className="sb-nav-links"
          style={s.navLinks}
          aria-label={isArabic ? "القائمة الرئيسية" : "Main navigation"}
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="sb-link"
              style={s.navLink}
            >
              {translate(
                item.label.replace(/\s+/g, "").charAt(0).toLowerCase() +
                  item.label.replace(/\s+/g, "").slice(1),
                { defaultValue: item.label }
              )}
            </Link>
          ))}
        </nav>

        <div style={s.navActions}>
          <button
            type="button"
            className="sb-icon"
            style={s.iconBtn}
            onClick={toggleLanguage}
            title={isArabic ? "English" : "العربية"}
          >
            {isArabic ? "EN" : "ع"}
          </button>

          <button
            type="button"
            className="sb-icon"
            style={s.iconBtn}
            onClick={toggleTheme}
            title={mode === "light" ? "Dark mode" : "Light mode"}
          >
            {mode === "light" ? <Moon /> : <Sun />}
          </button>

          {showNotifications && (
            <button
              type="button"
              className="sb-icon"
              style={s.notificationBtn}
              onClick={() => navigate("/notifications")}
              title={isArabic ? "الإشعارات" : "Notifications"}
              aria-label={
                isArabic ? "الإشعارات" : "Notifications"
              }
            >
              <Bell />

              {unreadCount > 0 && (
                <span style={s.notificationBadge}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          )}

          {isLoggedIn ? (
            <button
              type="button"
              className="sb-btn"
              style={s.signIn}
              onClick={logout}
            >
              {isArabic ? "تسجيل الخروج" : "Logout"}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="sb-btn"
                style={s.signIn}
                onClick={() => navigate("/login")}
              >
                {translate("signIn", {
                  defaultValue: isArabic ? "دخول" : "Sign in",
                })}
              </button>

              <button
                type="button"
                className="sb-btn"
                style={s.register}
                onClick={() => navigate("/register")}
              >
                {isArabic ? "إنشاء حساب" : "Register"}
              </button>
            </>
          )}
        </div>
      </header>
    </>
  );
}
