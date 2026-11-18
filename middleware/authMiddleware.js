
const jwt = require("jsonwebtoken");

// ================================
// VERIFY TOKEN
// ================================
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");

      return res.status(500).json({
        message: "Server configuration error"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        message: "Invalid token payload"
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    return next();

  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};


// ================================
// CHECK USER ROLE
// ================================
exports.allowRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    if (!Array.isArray(roles)) {
      return res.status(500).json({
        message: "Invalid role configuration"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    return next();
  };
};
