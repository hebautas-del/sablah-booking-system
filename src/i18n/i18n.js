import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const savedLanguage = localStorage.getItem("language") || "en";

const resources = {
  en: {
    translation: {
      home: "Home",
      search: "Search",
      viewVenues: "View Venues",
      becomeHost: "Become a Host",
      signIn: "Sign In",
      register: "Register",
      createAccount: "Create Account",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      fullName: "Full Name",
      phone: "Phone Number",
      forgotPassword: "Forgot Password?",
      login: "Login",
      logout: "Logout",
      bookNow: "Book Now",
      welcome: "Welcome to Sablah",
      language: "العربية",
      about: "About",
      contact: "Contact",
      partners: "Partners",
      privacy: "Privacy",
      terms: "Terms",
      cookies: "Cookies",
      company: "Company",
      legal: "Legal",
      footerDescription:
        "Powered by Oman Vision 2040 — empowering local SMEs and digital communities.",
      footerCopyright: "Made in the Sultanate of Oman",
      loginTitle: "Sablah Login",
      welcomeBack: "Welcome back",
      enterEmail: "Enter your Email",
      enterPassword: "Enter your password",
      loggingIn: "Logging in...",
    },
  },

  ar: {
    translation: {
      home: "الرئيسية",
      search: "البحث",
      viewVenues: "السبلات",
      becomeHost: "التسجيل كمالك",
      signIn: "دخول",
      register: "تسجيل",
      createAccount: "إنشاء حساب",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      fullName: "الاسم الكامل",
      phone: "رقم الهاتف",
      forgotPassword: "هل نسيت كلمة المرور؟",
      about: "من نحن",
      contact: "اتصل بنا",
      partners: "الشركاء",
      privacy: "الخصوصية",
      terms: "الشروط والأحكام",
      cookies: "ملفات تعريف الارتباط",
      company: "الشركة",
      legal: "الشؤون القانونية",
      footerDescription:
        "بدعم من رؤية عُمان 2040، لتمكين المؤسسات الصغيرة والمتوسطة والمجتمعات الرقمية.",
      footerCopyright: "صُنع في سلطنة عُمان",
      login: "دخول",
      logout: "تسجيل الخروج",
      bookNow: "احجز الآن",
      welcome: "مرحبًا بك في نظام حجز السبل",
      language: "English",
      loginTitle: "تسجيل الدخول إلى سبلة",
      welcomeBack: "مرحبًا بعودتك",
      enterEmail: "أدخل بريدك الإلكتروني",
      enterPassword: "أدخل كلمة المرور",
      loggingIn: "جارٍ تسجيل الدخول...",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

document.documentElement.lang = savedLanguage;
document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr";

export default i18n;
