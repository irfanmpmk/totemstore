const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const errorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/appError");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const checkoutRoutes = require("./routes/checkout");

require("dotenv").config();

const app = express();

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" })); // Allow your Vite frontend to access the API
app.use(express.json({ limit: "10mb" }));

// 2. Mount the product routes
app.use("/api/products", productRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/auth", authRoutes);

// Catch-all route handler for undefined endpoints
app.all("{*any}", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Senior Global Error Middleware Activator
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Senior Backend Engine optimized and active on port ${PORT}`);
});
