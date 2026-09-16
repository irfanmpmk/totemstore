const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

module.exports = (req, res, next) => {
  try {
    // Extract token from Authorization header (Format: Bearer <token>)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new AppError("Access denied. No authorization token provided.", 401),
      );
    }

    const token = authHeader.split(" ")[1];

    // Decode and verify token token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "super-fallback-secret-key-totem",
    );

    // Check if user has explicit admin privileges
    if (!decoded.is_admin) {
      return next(new AppError("Forbidden. Admin permissions required.", 403));
    }

    req.user = decoded; // Attach user payload to request profile
    next();
  } catch (error) {
    return next(
      new AppError("Invalid or expired authentication session.", 401),
    );
  }
};
