import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import hero from "../assets/hero.png";
import logo from "../assets/logo.png";

/* ---------- THEME TOKENS ---------- */
const themes = {
  light: {
    bg: "#faf7f2",
    text: "#6b5d4f",
    gold: "#c9a24a",
    goldDark: "#b8860b",
    heroWash: "rgba(250,244,232,0.82)",
  },
  dark: {
    bg: "#1b1611",
    text: "#c9bba7",
    gold: "#d9b25c",
    goldDark: "#b8860b",
    heroWash: "rgba(27,22,17,0.78)",
  },
};

const fontCss = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

.sb-btn {
  transition: transform .15s ease, box-shadow .15s ease;
}

.sb-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(184,134,11,.25);
}

.sb-btn:focus-visible {
  outline: 2px solid var(--sb-gold);
  outline-offset: 3px;
}

@media (max-width: 760px) {
  .sb-title {
    font-size: 56px !important;
  }

  .sb-subtitle-ar {
    font-size: clamp(10px, 2.5vw, 14px) !important;
  }
}
`;

/* ---------- ARROW ICON ---------- */
const Arrow = ({ isArabic }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{
      transform: isArabic ? "rotate(180deg)" : "none",
      flexShrink: 0,
    }}
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/* ---------- HOME PAGE ---------- */
export default function Home() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [mode, setMode] = useState(() =>
    localStorage.getItem("theme") === "dark" ? "dark" : "light"
  );

  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || i18n.language || "en"
  );

  const isArabic = language.startsWith("ar");
  const currentTheme = themes[mode];
  const s = makeStyles(currentTheme, isArabic);

  /* ---------- SYNC THEME ---------- */
  useEffect(() => {
    const syncTheme = () => {
      setMode(
        localStorage.getItem("theme") === "dark" ? "dark" : "light"
      );
    };

    window.addEventListener("themechange", syncTheme);
    window.addEventListener("storage", syncTheme);

    syncTheme();

    return () => {
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  /* ---------- SYNC LANGUAGE ---------- */
  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(
        localStorage.getItem("language") || i18n.language || "en"
      );
    };

    i18n.on("languageChanged", syncLanguage);
    window.addEventListener("languagechange", syncLanguage);
    window.addEventListener("storage", syncLanguage);

    syncLanguage();

    return () => {
      i18n.off("languageChanged", syncLanguage);
      window.removeEventListener("languagechange", syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, [i18n]);

  /* ---------- TRANSLATION ---------- */
  const translate = (key, fallback) =>
    t(key, { defaultValue: fallback });

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      lang={isArabic ? "ar" : "en"}
      style={{
        ...s.page,
        "--sb-gold": currentTheme.gold,
      }}
    >
      <style>{fontCss}</style>

      {/* HERO SECTION */}
      <section style={s.hero}>
        <div style={s.heroWash} />

        <div style={s.content}>
          {/* BIG LOGO */}
          <div style={s.medallionOuter}>
            <div style={s.medallionInner}>
              <img
                src={logo}
                alt={isArabic ? "شعار سبلة" : "Sablah logo"}
                style={s.heroLogo}
              />
            </div>
          </div>

          {/* TITLE */}
          <h1 className="sb-title" style={s.title}>
            {isArabic ? "سبلة" : "Sablah"}
          </h1>

          {/* TAGLINE */}
          <p style={s.tagline}>
            {translate(
              "homeTagline",
              isArabic ? "انسجام المجالس" : "Majlis Harmony"
            )}
          </p>

          {/* DESCRIPTION */}
          <p
            className={isArabic ? "sb-subtitle-ar" : ""}
            style={s.subtitle}
          >
            {translate(
              "homeSubtitle",
              isArabic
                ? "اكتشف واحجز أرقى السبلات والمجالس لمناسباتك المميزة، التقاليد تلتقي بالأناقة"
                : "Discover and book premium Sablah and Majlis venues for your special occasions. Tradition meets elegance."
            )}
          </p>

          {/* DECORATIVE DIVIDER */}
          <div style={s.divider} aria-hidden="true">
            <span style={s.line} />
            <span style={s.star}>★</span>
            <span style={s.line} />
          </div>

          {/* START BUTTON */}
          <button
            type="button"
            className="sb-btn"
            style={s.cta}
            onClick={() => navigate("/login")}
          >
            {translate("start", isArabic ? "ابدأ الآن" : "Start")}
            <Arrow isArabic={isArabic} />
          </button>
        </div>
      </section>
    </div>
  );
}

/* ---------- STYLES ---------- */
function makeStyles(t, isArabic) {
  const serif = "'Cormorant Garamond', Georgia, serif";
  const sans = "'Inter', system-ui, sans-serif";

  return {
    page: {
      fontFamily: isArabic
        ? " Arial, sans-serif"
        : sans,
      background: t.bg,
      color: t.text,
      minHeight: "100vh",
      margin: 0,
      transition: "background .3s ease, color .3s ease",
    },

    hero: {
      position: "relative",
      minHeight: 420,
      padding: "56px 20px 48px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxSizing: "border-box",
      backgroundImage: `url(${hero})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      transition: "background-color .3s ease",
    },

    heroWash: {
      position: "absolute",
      inset: 0,
      background: t.heroWash,
      transition: "background .3s ease",
    },

    content: {
      position: "relative",
      zIndex: 2,
      textAlign: "center",
      maxWidth: 900,
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },

    medallionOuter: {
      width: 170,
      height: 170,
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 6,
      boxSizing: "border-box",
      marginBottom: 22,
      boxShadow: "0 6px 20px rgba(184,134,11,0.25)",
    },

    medallionInner: {
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      overflow: "hidden",
      background: t.goldDark,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    heroLogo: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "50%",
      display: "block",
      boxShadow: "none",
      filter: "none",
    },

    title: {
      fontFamily: isArabic ? "Tahoma, Arial, sans-serif" : serif,
      fontWeight: 600,
      fontSize: 68,
      lineHeight: 1,
      margin: "0 0 10px",
      color: t.gold,
      letterSpacing: isArabic ? "normal" : "0.01em",
    },

    tagline: {
      fontFamily: isArabic
        ? "Tahoma, Arial, sans-serif"
        : serif,
      fontSize: 20,
      margin: "0 0 22px",
      color: t.text,
      letterSpacing: isArabic ? "normal" : "0.03em",
    },

    subtitle: {
      fontSize: isArabic ? 15 : 16,
      lineHeight: 1.9,
      margin: "0 0 26px",
      color: t.text,
      width: "100%",
      maxWidth: isArabic ? 900 : 420,
      whiteSpace: isArabic ? "nowrap" : "normal",
      textAlign: "center",
      overflow: "visible",
    },

    divider: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 30,
    },

    line: {
      width: 60,
      height: 1,
      background: t.gold,
      opacity: 0.6,
    },

    star: {
      color: t.gold,
      fontSize: 14,
    },

    cta: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: "13px 38px",
      border: "none",
      borderRadius: 10,
      color: "#fff",
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer",
      background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`,
      fontFamily: isArabic
        ? "Tahoma, Arial, sans-serif"
        : sans,
    },
  };
}
