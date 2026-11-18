import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import logo from "../assets/logo.png";

const defaultTheme = {
  bg: "#faf7f2",
  text: "#6b5d4f",
  heading: "#3b2f22",
  gold: "#c9a24a",
  goldDark: "#b8860b",
  border: "#ece4d6",
};

const darkTheme = {
  bg: "#121212",
  text: "#d1d1d1",
  heading: "#ffffff",
  gold: "#d4af55",
  goldDark: "#b8860b",
  border: "#333333",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

.sb-foot-link:hover {
  color: var(--sb-gold) !important;
  transition: color 0.2s ease;
}

@media (max-width: 760px) {
  .sb-footer-grid {
    grid-template-columns: 1fr 1fr !important;
  }

  .sb-footer-brand {
    grid-column: 1 / -1;
  }
}
`;

export default function Footer({ t: theme = defaultTheme }) {
  const { t, i18n } = useTranslation();

  // Language state
  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || i18n.language || "en",
  );

  // Dark mode state
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  // Sync language changes
  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(localStorage.getItem("language") || i18n.language || "en");
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

  // Sync theme changes
  useEffect(() => {
    const syncTheme = () => {
      setIsDark(localStorage.getItem("theme") === "dark");
    };

    window.addEventListener("themechange", syncTheme);
    window.addEventListener("storage", syncTheme);

    syncTheme();

    return () => {
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const isArabic = language.startsWith("ar");

  // Choose theme colors
  const activeTheme = isDark ? darkTheme : theme;

  // Translation helper
  const translate = (key, fallback) => t(key, { defaultValue: fallback });

  const companyLinks = [
    {
      label: "about",
      fallback: isArabic ? "من نحن" : "About",
      path: "/about",
    },
    {
      label: "contact",
      fallback: isArabic ? "اتصل بنا" : "Contact",
      path: "/contact",
    },
    {
      label: "partners",
      fallback: isArabic ? "الشركاء" : "Partners",
      path: "/partners",
    },
  ];

  const legalLinks = [
    {
      label: "privacy",
      fallback: isArabic ? "الخصوصية" : "Privacy",
      path: "/privacy-policy",
    },
    {
      label: "terms",
      fallback: isArabic ? "الشروط والأحكام" : "Terms",
      path: "/terms",
    },
    {
      label: "cookies",
      fallback: isArabic ? "ملفات تعريف الارتباط" : "Cookies",
      path: "/cookies",
    },
  ];

  const s = makeStyles(activeTheme, isArabic);

  return (
    <footer
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        ...s.footer,
        "--sb-gold": activeTheme.gold,
        transition: "background 0.25s ease, color 0.25s ease",
      }}
    >
      <style>{css}</style>

      <div className="sb-footer-grid" style={s.grid}>
        {/* Brand */}
        <div className="sb-footer-brand">
          <Link to="/" style={s.brand}>
            <span style={s.mark}>
              <img
                src={logo}
                alt={isArabic ? "شعار سبلة" : "Sablah logo"}
                style={{
                  width: "47px",
                  height: "47px",
                  objectFit: "contain",
                  borderRadius: "30%",
                  display: "block",
                  boxShadow: "none",
                  filter: "none",
                }}
              />
            </span>

            <span style={s.brandName}>{isArabic ? "سبلة" : "Sablah"}</span>
          </Link>

          <p style={s.text}>
            {translate(
              "footerDescription",
              isArabic
                ? "بدعم من رؤية عُمان 2040، لتمكين المؤسسات الصغيرة والمتوسطة والمجتمعات الرقمية."
                : "Powered by Oman Vision 2040 — empowering local SMEs and digital communities.",
            )}
          </p>
        </div>

        {/* Company */}
        <FooterCol
          title={translate("company", isArabic ? "الشركة" : "Company")}
          links={companyLinks}
          s={s}
          translate={translate}
        />

        {/* Legal */}
        <FooterCol
          title={translate("legal", isArabic ? "الشؤون القانونية" : "Legal")}
          links={legalLinks}
          s={s}
          translate={translate}
        />
      </div>

      {/* Copyright */}
      <div style={s.copyright}>
        © {new Date().getFullYear()} {isArabic ? "سبلة" : "Sablah"} ·{" "}
        {translate(
          "footerCopyright",
          isArabic ? "صُنع في سلطنة عُمان" : "Made in the Sultanate of Oman",
        )}
      </div>
    </footer>
  );
}

function FooterCol({ title, links, s, translate }) {
  return (
    <div>
      <h4 style={s.heading}>{title}</h4>

      <ul style={s.list}>
        {links.map((link) => (
          <li key={link.path}>
            <Link to={link.path} className="sb-foot-link" style={s.link}>
              {translate(link.label, link.fallback)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function makeStyles(t, isArabic) {
  const serif = "'Cormorant Garamond', Georgia, serif";

  return {
    footer: {
      fontFamily: isArabic
        ? "Tahoma, Arial, sans-serif"
        : "'Inter', system-ui, sans-serif",
      color: t.text,
      background: t.bg,
      borderTop: `1px solid ${t.border}`,
      width: "100%",
      boxSizing: "border-box",
    },

    grid: {
      maxWidth: 1100,
      margin: "0 auto",
      padding: "36px 16px 28px",
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr",
      gap: 32,
    },

    brand: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
      textDecoration: "none",
    },

    mark: {
      width: 36,
      height: 36,
      borderRadius: 8,
      background: `linear-gradient(135deg, ${t.goldDark}, ${t.gold})`,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    brandName: {
      fontFamily: serif,
      fontWeight: 600,
      fontSize: 20,
      color: t.gold,
    },

    text: {
      fontSize: 14,
      lineHeight: 1.8,
      maxWidth: 320,
      margin: 0,
      color: t.text,
    },

    heading: {
      fontFamily: isArabic ? "Tahoma, Arial, sans-serif" : serif,
      fontSize: 15,
      fontWeight: 700,
      color: t.heading,
      margin: "0 0 12px",
    },

    list: {
      listStyle: "none",
      padding: 0,
      margin: 0,
      display: "grid",
      gap: 10,
    },

    link: {
      textDecoration: "none",
      fontSize: 14,
      color: t.text,
      transition: "color 0.2s ease",
    },

    copyright: {
      borderTop: `1px solid ${t.border}`,
      textAlign: "center",
      fontSize: 12,
      padding: "18px 16px",
      color: t.text,
    },
  };
}
