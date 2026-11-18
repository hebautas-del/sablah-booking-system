
/* eslint-disable react-hooks/static-components */
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../api";

export default function Login() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [mode, setMode] = useState(() =>
    localStorage.getItem("theme") === "dark" ? "dark" : "light"
  );

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const syncTheme = () => {
      setMode(
        localStorage.getItem("theme") === "dark" ? "dark" : "light"
      );
    };

    const syncLanguage = () => {
      const language = localStorage.getItem("language");

      if (language && i18n.language !== language) {
        i18n.changeLanguage(language);
      }
    };

    syncTheme();
    syncLanguage();

    window.addEventListener("themechange", syncTheme);
    window.addEventListener("storage", syncTheme);
    window.addEventListener("languagechange", syncLanguage);

    return () => {
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("languagechange", syncLanguage);
    };
  }, [i18n]);

  const dark = mode === "dark";
  const isArabic = i18n.language?.startsWith("ar");

  const colors = {
    page: dark ? "#1b1611" : "#f5f1eb",
    card: dark ? "#282017" : "#ffffff",
    text: dark ? "#f1e7d6" : "#3b2f22",
    muted: dark ? "#c9bba7" : "#555555",
    input: dark ? "#33291f" : "#ffffff",
    border: dark ? "#665237" : "#dddddd",
    gold: dark ? "#d9b25c" : "#c89b3c",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      alert(
        t("login.emailRequired", {
          defaultValue: isArabic
            ? "يرجى إدخال البريد الإلكتروني"
            : "Email is required",
        })
      );
      return;
    }

    if (!formData.password) {
      alert(
        t("login.passwordRequired", {
          defaultValue: isArabic
            ? "يرجى إدخال كلمة المرور"
            : "Password is required",
        })
      );
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const data = response.data;

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      const user = data.user || data;

      if (user.name) {
        localStorage.setItem("name", user.name);
      }

      if (user.role) {
        localStorage.setItem("role", user.role);
      }

      if (user.email) {
        localStorage.setItem("email", user.email);
      }

      if (user.phone) {
        localStorage.setItem("phone", user.phone);
      }

      const role = user.role || localStorage.getItem("role");

      if (role === "owner") {
        navigate("/owner-dashboard");
      } else if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/venues");
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          t("login.loginFailed", {
            defaultValue: isArabic
              ? "فشل تسجيل الدخول. يرجى التأكد من البريد الإلكتروني وكلمة المرور."
              : "Login failed. Please check your email and password.",
          })
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "11px",
    marginTop: "6px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: `1px solid ${colors.border}`,
    outline: "none",
    background: colors.input,
    color: colors.text,
    fontSize: "14px",
    transition: "all .3s ease",
  };

  const labelStyle = {
    display: "block",
    color: colors.muted,
    fontSize: "14px",
    fontWeight: "bold",
    marginTop: "5px",
    textAlign: isArabic ? "right" : "left",
  };

  const EyeIcon = ({ visible }) => (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {visible ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a12.5 12.5 0 0 1-3.1 4" />
          <path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.8-.8" />
        </>
      )}
    </svg>
  );

  return (
    <div
      className="login-page"
      dir={isArabic ? "rtl" : "ltr"}
      lang={isArabic ? "ar" : "en"}
      style={{
        minHeight: "100vh",
        background: colors.page,
        color: colors.text,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px 20px",
        fontFamily: isArabic
          ? "Tahoma, Arial, sans-serif"
          : "Arial, sans-serif",
        boxSizing: "border-box",
        transition: "background .3s ease, color .3s ease",
      }}
    >
      <style>{`
        .login-input::placeholder {
          color: ${dark ? "#c9bba7" : "#777777"};
          opacity: 1;
        }

        .login-input:focus {
          border-color: ${colors.gold} !important;
          box-shadow: 0 0 0 3px rgba(200, 155, 60, 0.15);
        }

        .login-submit:hover {
          filter: brightness(0.92);
        }

        .login-submit:focus-visible,
        .login-eye:focus-visible,
        .login-link:focus-visible {
          outline: 2px solid ${colors.gold};
          outline-offset: 3px;
        }

        .login-eye:hover {
          color: ${colors.gold} !important;
        }

        .login-input,
        .login-card,
        .login-submit {
          transition: background .3s ease, color .3s ease,
            border-color .3s ease, box-shadow .3s ease;
        }

        .login-input {
          text-align: start;
        }

        .login-password-input {
          direction: ltr;
          text-align: left;
        }

        .login-link {
          color: ${colors.gold};
          cursor: pointer;
          font-weight: bold;
          text-decoration: none;
        }

        .login-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 22px !important;
          }
        }
      `}</style>

      <div
        className="login-card"
        style={{
          width: "100%",
          maxWidth: "450px",
          background: colors.card,
          padding: "28px",
          borderRadius: "15px",
          border: `1px solid ${colors.border}`,
          boxShadow: dark
            ? "0 5px 20px rgba(0,0,0,0.25)"
            : "0 5px 20px rgba(0,0,0,0.1)",
          boxSizing: "border-box",
          transition: "all .3s ease",
        }}
      >
        <h2
          style={{
            marginBottom: "5px",
            color: colors.gold,
            fontSize: "20px",
          }}
        >
          {t("login.welcome", {
            defaultValue: isArabic ? "مرحباً بعودتك" : "WELCOME BACK",
          })}
        </h2>

        <h1
          style={{
            marginTop: 0,
            marginBottom: "8px",
            color: colors.text,
            fontSize: "28px",
          }}
        >
          {t("login.title", {
            defaultValue: isArabic ? "تسجيل الدخول" : "Sign In",
          })}
        </h1>

        <p
          style={{
            color: colors.muted,
            fontSize: "14px",
            marginTop: 0,
            marginBottom: "24px",
          }}
        />

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email" style={labelStyle}>
            {t("login.email", {
              defaultValue: isArabic ? "البريد الإلكتروني" : "Email",
            })}
          </label>

          <input
            id="login-email"
            className="login-input"
            style={inputStyle}
            type="email"
            name="email"
            placeholder={t("login.emailPlaceholder", {
              defaultValue: isArabic
                ? "أدخل بريدك الإلكتروني"
                : "Enter your email",
            })}
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="login-password" style={labelStyle}>
            {t("login.password", {
              defaultValue: isArabic ? "كلمة المرور" : "Password",
            })}
          </label>

          <div style={{ position: "relative" }}>
            <input
              id="login-password"
              className="login-input login-password-input"
              style={{
                ...inputStyle,
                marginBottom: "10px",
                paddingRight: isArabic ? "11px" : "42px",
                paddingLeft: isArabic ? "42px" : "11px",
              }}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={t("login.passwordPlaceholder", {
                defaultValue: isArabic
                  ? "أدخل كلمة المرور"
                  : "Enter your password",
              })}
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="login-eye"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword
                  ? t("login.hidePassword", {
                      defaultValue: isArabic
                        ? "إخفاء كلمة المرور"
                        : "Hide password",
                    })
                  : t("login.showPassword", {
                      defaultValue: isArabic
                        ? "إظهار كلمة المرور"
                        : "Show password",
                    })
              }
              title={
                showPassword
                  ? t("login.hidePassword", {
                      defaultValue: isArabic
                        ? "إخفاء كلمة المرور"
                        : "Hide password",
                    })
                  : t("login.showPassword", {
                      defaultValue: isArabic
                        ? "إظهار كلمة المرور"
                        : "Show password",
                    })
              }
              style={{
                position: "absolute",
                [isArabic ? "left" : "right"]: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                color: colors.muted,
                cursor: "pointer",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EyeIcon visible={showPassword} />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: isArabic ? "flex-start" : "flex-end",
              marginTop: "4px",
              marginBottom: "20px",
            }}
          >
            <Link
              to="/forgot-password"
              className="login-link"
              style={{ fontSize: "13px" }}
            >
              {t("login.forgotPassword", {
                defaultValue: isArabic
                  ? "هل نسيت كلمة المرور؟"
                  : "Forgot Password?",
              })}
            </Link>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: colors.gold,
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "15px",
              marginTop: "4px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? t("login.loading", {
                  defaultValue: isArabic
                    ? "جارٍ تسجيل الدخول..."
                    : "Signing in...",
                })
              : t("login.submit", {
                  defaultValue: isArabic ? "تسجيل الدخول" : "Sign In",
                })}
          </button>

          <p
            style={{
              textAlign: "center",
              marginTop: "18px",
              marginBottom: 0,
              color: colors.muted,
              fontSize: "14px",
            }}
          >
            {t("login.noAccount", {
              defaultValue: isArabic
                ? "ليس لديك حساب؟"
                : "Don't have an account?",
            })}{" "}
            <Link to="/register" className="login-link">
              {t("login.register", {
                defaultValue: isArabic ? "إنشاء حساب" : "Sign up",
              })}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
