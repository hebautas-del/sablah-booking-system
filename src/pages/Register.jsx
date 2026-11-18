
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Register() {
  const navigate = useNavigate();

  // Theme
  const [mode, setMode] = useState(() =>
    localStorage.getItem("theme") === "dark" ? "dark" : "light"
  );

  // Language
  const [language, setLanguage] = useState(() =>
    localStorage.getItem("language") || "en"
  );

  const isArabic = language === "ar";
  const dark = mode === "dark";

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    role: "user",
    name: "",
    email: "",
    phone: "",
    wilayat: "",
    password: "",
    confirm: ""
  });

  const [loading, setLoading] = useState(false);
  const mapElement = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const [coordinates, setCoordinates] = useState({ lat: 23.5880, lng: 58.3829 });
  const [mapReady, setMapReady] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);
  const [locating, setLocating] = useState(false);

  // Sync theme with Navbar
  useEffect(() => {
    const syncTheme = () => {
      setMode(
        localStorage.getItem("theme") === "dark" ? "dark" : "light"
      );
    };

    window.addEventListener("themechange", syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  // Sync language with Navbar
  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(localStorage.getItem("language") || "en");
    };

    window.addEventListener("languagechange", syncLanguage);
    window.addEventListener("storage", syncLanguage);

    return () => {
      window.removeEventListener("languagechange", syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  // Interactive OpenStreetMap picker (Leaflet). The selected marker is saved
  // with the account as latitude and longitude.
  useEffect(() => {
    let cancelled = false;

    const loadLeaflet = () => new Promise((resolve, reject) => {
      if (window.L) {
        resolve(window.L);
        return;
      }

      const existingScript = document.querySelector('script[data-leaflet="true"]');
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.L), { once: true });
        existingScript.addEventListener("error", reject, { once: true });
        return;
      }

      if (!document.querySelector('link[data-leaflet="true"]')) {
        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        stylesheet.dataset.leaflet = "true";
        document.head.appendChild(stylesheet);
      }

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.dataset.leaflet = "true";
      script.onload = () => resolve(window.L);
      script.onerror = reject;
      document.body.appendChild(script);
    });

    loadLeaflet().then((L) => {
      if (cancelled || !mapElement.current || mapInstance.current) return;

      const map = L.map(mapElement.current).setView([coordinates.lat, coordinates.lng], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      const marker = L.marker([coordinates.lat, coordinates.lng], { draggable: true }).addTo(map);
      const updateCoordinates = (latlng) => {
        setCoordinates({
          lat: Number(latlng.lat.toFixed(6)),
          lng: Number(latlng.lng.toFixed(6))
        });
        setLocationSelected(true);
      };

      map.on("click", (event) => {
        marker.setLatLng(event.latlng);
        updateCoordinates(event.latlng);
      });
      marker.on("dragend", () => updateCoordinates(marker.getLatLng()));

      mapInstance.current = map;
      markerInstance.current = marker;
      setMapReady(true);
      window.setTimeout(() => map.invalidateSize(), 100);
    }).catch((error) => console.error("Map loading failed:", error));

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current && markerInstance.current) {
      const point = [coordinates.lat, coordinates.lng];
      markerInstance.current.setLatLng(point);
      mapInstance.current.setView(point, Math.max(mapInstance.current.getZoom(), 13));
    }
  }, [coordinates]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t("Your browser does not support location access.", "المتصفح لا يدعم تحديد الموقع."));
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({
          lat: Number(coords.latitude.toFixed(6)),
          lng: Number(coords.longitude.toFixed(6))
        });
        setLocationSelected(true);
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert(t("Could not access your location. You can select a point on the map.", "تعذر الوصول إلى موقعك. يمكنك اختيار نقطة على الخريطة."));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Colors
  const colors = {
    page: dark ? "#1b1611" : "#f5f1eb",
    card: dark ? "#282017" : "#ffffff",
    text: dark ? "#f1e7d6" : "#3b2f22",
    muted: dark ? "#c9bba7" : "#555555",
    input: dark ? "#33291f" : "#ffffff",
    border: dark ? "#665237" : "#dddddd",
    gold: dark ? "#d9b25c" : "#c89b3c",
    selectedRole: dark ? "#3a2d1d" : "#fff7e6",
    unselectedRole: dark ? "#33291f" : "#ffffff",
    unselectedText: dark ? "#c9bba7" : "#555555"
  };

  const t = (english, arabic) => isArabic ? arabic : english;

  // Validation rules
  const isValidName = (name) =>
    /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(name.trim());

  const isValidEmail = (email) =>
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  const isValidPhone = (phone) =>
    /^[0-9]{8}$/.test(phone);

  const isValidPassword = (password) =>
    password.length > 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9\s]/.test(password) &&
    !/\s/.test(password);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow only 8 digits in the phone field
    if (name === "phone") {
      const digitsOnly = value.replace(/[^0-9]/g, "").slice(0, 8);

      setFormData((prev) => ({
        ...prev,
        phone: digitsOnly
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();
    const password = formData.password;

    // Name validation
    if (!name) {
      return alert(t("Please enter your full name", "يرجى إدخال الاسم الكامل"));
    }

    if (!isValidName(name)) {
      return alert(
        t(
          "Name must contain letters only. Spaces, hyphens and apostrophes are allowed.",
          "يجب أن يحتوي الاسم على أحرف فقط، مع السماح بالمسافات والشرطة والفاصلة العليا."
        )
      );
    }

    // Email validation
    if (!email) {
      return alert(t("Please enter your email", "يرجى إدخال البريد الإلكتروني"));
    }

    if (!isValidEmail(email)) {
      return alert(t("Invalid email format", "صيغة البريد الإلكتروني غير صحيحة"));
    }

    // Phone validation
    if (!phone) {
      return alert(t("Please enter your phone number", "يرجى إدخال رقم الهاتف"));
    }

    if (!isValidPhone(phone)) {
      return alert(
        t(
          "Phone number must contain exactly 8 digits.",
          "يجب أن يتكون رقم الهاتف من 8 أرقام بالضبط."
        )
      );
    }

    // Password validation
    if (!isValidPassword(password)) {
      return alert(
        t(
          "Password must be more than 8 characters and include uppercase, lowercase, a number and a special character. Spaces are not allowed.",
          "يجب أن تتكون كلمة المرور من أكثر من 8 أحرف، وأن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص، ولا يُسمح بالمسافات."
        )
      );
    }

    // Confirm password
    if (password !== formData.confirm) {
      return alert(
        t("Passwords do not match", "كلمتا المرور غير متطابقتين")
      );
    }

    try {
      setLoading(true);

      // Send account information to the backend
      const dataToSend = {
        name,
        email,
        phone,
        wilayat: formData.wilayat.trim(),
        locationLat: locationSelected ? coordinates.lat : null,
        locationLng: locationSelected ? coordinates.lng : null,
        password,
        role: formData.role
      };

      await API.post("/auth/register", dataToSend);

      alert(
        t("Registration successful!", "تم إنشاء الحساب بنجاح!")
      );

      navigate("/login");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        t("Registration failed", "فشل إنشاء الحساب")
      );
    } finally {
      setLoading(false);
    }
  };

  // Account type button style
  const roleBtn = (role) => {
    const selected = formData.role === role;

    return {
      flex: 1,
      padding: "12px",
      borderRadius: "10px",
      border: selected
        ? `2px solid ${colors.gold}`
        : `1px solid ${colors.border}`,
      background: selected
        ? colors.selectedRole
        : colors.unselectedRole,
      cursor: "pointer",
      fontWeight: "bold",
      color: selected ? colors.gold : colors.unselectedText,
      transition: "all .3s ease"
    };
  };

  // Input style
  const inputStyle = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "11px",
    marginTop: "6px",
    marginBottom: "14px",
    borderRadius: "8px",
    border: `1px solid ${colors.border}`,
    outline: "none",
    background: colors.input,
    color: colors.text,
    fontSize: "14px",
    transition: "all .3s ease"
  };

  // Label style
  const labelStyle = {
    display: "block",
    color: colors.muted,
    fontSize: "14px",
    fontWeight: "bold",
    marginTop: "5px",
    textAlign: isArabic ? "right" : "left"
  };

  // Eye icon
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

  // Reusable password field
  const renderPasswordField = ({
    id,
    name,
    label,
    value,
    visible,
    setVisible,
    autoComplete,
    showText,
    hideText
  }) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>

      <div style={{ position: "relative" }}>
        <input
          id={id}
          className="register-input"
          style={{
            ...inputStyle,
            paddingRight: isArabic ? "11px" : "42px",
            paddingLeft: isArabic ? "42px" : "11px",
            direction: "ltr",
            textAlign: isArabic ? "right" : "left"
          }}
          type={visible ? "text" : "password"}
          name={name}
          placeholder={label}
          value={value}
          onChange={handleChange}
          autoComplete={autoComplete}
          minLength={9}
          required
        />

        <button
          type="button"
          className="register-eye"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? hideText : showText}
          title={visible ? hideText : showText}
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
            justifyContent: "center"
          }}
        >
          <EyeIcon visible={visible} />
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="register-page"
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
        transition: "background .3s ease, color .3s ease"
      }}
    >
      <style>{`
        .register-input::placeholder {
          color: ${dark ? "#c9bba7" : "#777777"};
          opacity: 1;
        }

        .register-input:focus {
          border-color: ${colors.gold} !important;
          box-shadow: 0 0 0 3px rgba(200, 155, 60, 0.15);
        }

        .register-submit:hover:not(:disabled) {
          filter: brightness(0.92);
        }

        .register-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .register-submit:focus-visible,
        .register-role:focus-visible,
        .register-eye:focus-visible {
          outline: 2px solid ${colors.gold};
          outline-offset: 3px;
        }

        .register-input,
        .register-card,
        .register-submit {
          transition: background .3s ease, color .3s ease,
            border-color .3s ease, box-shadow .3s ease;
        }

        .register-eye:hover {
          color: ${colors.gold} !important;
        }

        @media (max-width: 480px) {
          .register-card {
            padding: 22px !important;
          }

          .register-password-row {
            flex-direction: column;
            gap: 0 !important;
          }
        }
      `}</style>

      <div
        className="register-card"
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
          transition: "all .3s ease"
        }}
      >
        <h2
          style={{
            marginBottom: "5px",
            color: colors.gold,
            fontSize: "20px"
          }}
        >
          {t("GET STARTED", "ابدأ الآن")}
        </h2>

        <h1
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: colors.text,
            fontSize: "28px"
          }}
        >
          {t("Create your account", "أنشئ حسابك")}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Account type */}
          <div style={{ marginBottom: "18px" }}>
            <h5
              style={{
                marginTop: 0,
                marginBottom: "10px",
                color: colors.text,
                fontSize: "14px"
              }}
            >
              {t("Account Type", "نوع الحساب")}
            </h5>

            <div
              style={{
                display: "flex",
                gap: "10px",
                width: "100%"
              }}
            >
              <button
                type="button"
                className="register-role"
                style={roleBtn("user")}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    role: "user"
                  }))
                }
              >
                {t("Guest", "مستخدم")}
              </button>

              <button
                type="button"
                className="register-role"
                style={roleBtn("owner")}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    role: "owner"
                  }))
                }
              >
                {t("Owner", "مالك")}
              </button>
            </div>
          </div>

          {/* Full Name */}
          <label htmlFor="register-name" style={labelStyle}>
            {t("Full Name", "الاسم الكامل")}
          </label>

          <input
            id="register-name"
            className="register-input"
            style={inputStyle}
            name="name"
            placeholder={t("Full Name", "الاسم الكامل")}
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            maxLength={100}
            required
          />

          {/* Email */}
          <label htmlFor="register-email" style={labelStyle}>
            {t("Email Address", "البريد الإلكتروني")}
          </label>

          <input
            id="register-email"
            className="register-input"
            style={inputStyle}
            type="email"
            name="email"
            placeholder={t("Email Address", "البريد الإلكتروني")}
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            maxLength={254}
            required
          />

          {/* Phone */}
          <label htmlFor="register-phone" style={labelStyle}>
            {t("Phone Number", "رقم الهاتف")}
          </label>

          <input
            id="register-phone"
            className="register-input"
            style={inputStyle}
            type="tel"
            name="phone"
            placeholder={t("8-digit phone number", "رقم الهاتف (8 أرقام)")}
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
            inputMode="numeric"
            maxLength={8}
            required
          />

          {/* Optional account location and interactive map */}
          <div style={{ marginTop: "4px", marginBottom: "16px" }}>
            <label htmlFor="register-location" style={labelStyle}>
              {formData.role === "owner"
                ? t("Owner / Business Wilayat (optional)", "ولاية المالك / النشاط (اختياري)")
                : t("Your Wilayat (optional)", "ولايتك (اختياري)")}
            </label>

            <input
              id="register-location"
              className="register-input"
              style={inputStyle}
              type="text"
              name="wilayat"
              placeholder={t("Enter your wilayat or area (e.g. Seeb)", "أدخل الولاية أو المنطقة (مثال: السيب)")}
              value={formData.wilayat}
              onChange={handleChange}
              autoComplete="address-level2"
            />

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "8px"
            }}>
              <span style={{ ...labelStyle, marginTop: 0 }}>
                {formData.role === "owner"
                  ? t("Select your business area on the map", "حدد منطقة نشاطك على الخريطة")
                  : t("Select your location on the map", "حدد موقعك على الخريطة")}
              </span>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating}
                style={{
                  border: `1px solid ${colors.gold}`,
                  borderRadius: "8px",
                  background: "transparent",
                  color: colors.gold,
                  padding: "7px 10px",
                  cursor: locating ? "wait" : "pointer",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              >
                {locating
                  ? t("Locating...", "جارٍ تحديد الموقع...")
                  : t("Use my location", "استخدم موقعي")}
              </button>
            </div>

            <div
              ref={mapElement}
              role="application"
              aria-label={t("Interactive location map. Click to place the marker or drag it.", "خريطة تفاعلية. اضغط لتحديد الموقع أو اسحب العلامة.")}
              style={{
                width: "100%",
                height: "230px",
                borderRadius: "10px",
                border: `1px solid ${colors.border}`,
                overflow: "hidden",
                background: colors.input,
                zIndex: 0
              }}
            />

            <p style={{
              color: colors.muted,
              fontSize: "12px",
              margin: "8px 0 0",
              textAlign: isArabic ? "right" : "left"
            }}>
              {t(
                "Click the map or drag the pin to choose a location. You can also use your device location.",
                "اضغط على الخريطة أو اسحب العلامة لاختيار الموقع. يمكنك أيضاً استخدام موقع جهازك."
              )}
            </p>
            <div style={{
              display: "flex",
              gap: "8px",
              marginTop: "8px",
              fontSize: "12px",
              color: colors.muted,
              direction: "ltr"
            }}>
              {locationSelected ? (
                <>
                  <span>Lat: {coordinates.lat}</span>
                  <span>Lng: {coordinates.lng}</span>
                </>
              ) : (
                <span>{t("No exact point selected yet", "لم يتم تحديد نقطة دقيقة بعد")}</span>
              )}
              {!mapReady && <span>{t("Loading map...", "جارٍ تحميل الخريطة...")}</span>}
            </div>
          </div>

          {/* Password fields */}
          <div
            className="register-password-row"
            style={{
              display: "flex",
              gap: "10px"
            }}
          >
            {renderPasswordField({
              id: "register-password",
              name: "password",
              label: t("Password", "كلمة المرور"),
              value: formData.password,
              visible: showPassword,
              setVisible: setShowPassword,
              autoComplete: "new-password",
              showText: t("Show password", "إظهار كلمة المرور"),
              hideText: t("Hide password", "إخفاء كلمة المرور")
            })}

            {renderPasswordField({
              id: "register-confirm",
              name: "confirm",
              label: t("Confirm Password", "تأكيد كلمة المرور"),
              value: formData.confirm,
              visible: showConfirmPassword,
              setVisible: setShowConfirmPassword,
              autoComplete: "new-password",
              showText: t(
                "Show confirm password",
                "إظهار تأكيد كلمة المرور"
              ),
              hideText: t(
                "Hide confirm password",
                "إخفاء تأكيد كلمة المرور"
              )
            })}
          </div>

          <p
            style={{
              color: colors.muted,
              fontSize: "12px",
              marginTop: "0",
              marginBottom: "12px",
              textAlign: isArabic ? "right" : "left"
            }}
          >
            {t(
              "Use more than 8 characters, including uppercase and lowercase letters, a number and a special character. No spaces.",
              "استخدم أكثر من 8 أحرف، مع حرف كبير وحرف صغير ورقم ورمز خاص، وبدون مسافات."
            )}
          </p>

          {/* Submit */}
          <button
            type="submit"
            className="register-submit"
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
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="8" r="4" />
              <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
              <path d="M19 8v6" />
              <path d="M16 11h6" />
            </svg>

            <span>
              {loading
                ? t("Creating Account...", "جاري إنشاء الحساب...")
                : t("Create Account", "إنشاء حساب")}
            </span>
          </button>

          {/* Login link */}
          <p style={{ textAlign: "center", marginTop: "16px" }}>
            {t("Already have an account?", "لديك حساب بالفعل؟")}{" "}

            <span
              role="link"
              tabIndex={0}
              onClick={() => navigate("/login")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate("/login");
                }
              }}
              style={{
                color: colors.gold,
                cursor: "pointer",
                fontWeight: "bold",
                textDecoration: "underline"
              }}
            >
              {t("Sign in", "تسجيل الدخول")}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
