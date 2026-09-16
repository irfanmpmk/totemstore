module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Send minimal data in production to prevent leaking system vulnerability details
  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production Mode
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // Unknown critical hosting or database hardware fault
      console.error("💥 CRITICAL UNKNOWN ERROR:", err);
      res.status(500).json({
        status: "error",
        message: "Something went radically wrong on our systems.",
      });
    }
  }
};
