// backend/routes/auth.js
const verifyAdmin = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const AppError = require("../utils/appError");

// 1. POST /api/auth/login - Authenticate User or Admin
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError("Please provide both an email and password.", 400),
    );
  }

  try {
    const userQuery = "SELECT * FROM users WHERE email = $1;";
    const result = await db.query(userQuery, [email.toLowerCase().trim()]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return next(new AppError("Incorrect email or password.", 401));
    }

    const token = jwt.sign(
      { id: user.id, is_admin: user.is_admin },
      process.env.JWT_SECRET || "super-fallback-secret-key-totem",
      { expiresIn: "7d" },
    );

    delete user.password_hash; // Security: Strip hash string out of response memory

    return res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// 2. POST /api/auth/register - Register a new customer account securely
router.post("/register", async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new AppError("Please fill out all identity credentials.", 400));
  }

  try {
    const checkEmail = "SELECT id FROM users WHERE email = $1;";
    const emailResult = await db.query(checkEmail, [
      email.toLowerCase().trim(),
    ]);

    if (emailResult.rows.length > 0) {
      return next(
        new AppError("An account with this email already exists.", 400),
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const insertUserQuery = `
      INSERT INTO users (name, email, password_hash, is_admin)
      VALUES ($1, $2, $3, FALSE)
      RETURNING id, name, email, is_admin, created_at;
    `;
    const result = await db.query(insertUserQuery, [
      name,
      email.toLowerCase().trim(),
      passwordHash,
    ]);
    const newUser = result.rows[0];

    const token = jwt.sign(
      { id: newUser.id, is_admin: newUser.is_admin },
      process.env.JWT_SECRET || "super-fallback-secret-key-totem",
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      success: true,
      token,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/register-admin - Create a secondary admin account (Protected)
router.post("/register-admin", verifyAdmin, async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new AppError("Please fill out all identity credentials.", 400));
  }

  try {
    // Ensure email uniqueness
    const checkEmail = "SELECT id FROM users WHERE email = $1;";
    const emailResult = await db.query(checkEmail, [
      email.toLowerCase().trim(),
    ]);
    if (emailResult.rows.length > 0) {
      return next(
        new AppError("An account with this email already exists.", 400),
      );
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user with is_admin set explicitly to TRUE
    const insertAdminQuery = `
      INSERT INTO users (name, email, password_hash, is_admin)
      VALUES ($1, $2, $3, TRUE)
      RETURNING id, name, email, is_admin, created_at;
    `;
    const result = await db.query(insertAdminQuery, [
      name,
      email.toLowerCase().trim(),
      passwordHash,
    ]);

    return res.status(201).json({
      success: true,
      message: "New Admin account registered successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
