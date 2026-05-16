require("dotenv").config();
const sendEmail = require("./utils/sendEmail");

sendEmail(
  "yourgmail@gmail.com",
  "Test Email",
  "Hello! Your email system is working 🎉"
)
  .then(() => console.log("Email sent successfully"))
  .catch((err) => console.log("Error:", err));