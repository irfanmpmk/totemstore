// routes/products.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const AppError = require("../utils/appError");

// POST /api/products - Create a new item (Admin authorized route)
router.post("/", async (req, res, next) => {
  const { title, description, price, stock_quantity, media_urls, category } =
    req.body;

  // Strict server-side validation
  if (!title || !description || !price) {
    return next(new AppError("Missing required product fields.", 400));
  }

  try {
    const queryText = `
      INSERT INTO products (title, description, price, stock_quantity, media_urls)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [
      title,
      description,
      price,
      stock_quantity || 0,
      media_urls || [], // Array of URLs from Cloudinary/S3
    ];

    const result = await db.query(queryText, values);

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Database Error in Product Creation:", error);
    return next(new AppError("Internal server error occurred.", 500));
  }
});

// GET /api/products - Fetch all catalog items ordered by newest arrival
router.get("/", async (req, res, next) => {
  try {
    const queryText = "SELECT * FROM products ORDER BY created_at DESC;";
    const result = await db.query(queryText);

    return res.status(200).json({
      success: true,
      products: result.rows,
    });
  } catch (error) {
    console.error("Database Error in Product Retrieval:", error);
    return next(new AppError("Internal server error occurred.", 500));
  }
});

router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { title, description, price, stock_quantity, media_urls, category } =
    req.body;
  try {
    const queryText = `
      UPDATE products
      SET title = $1,
      description = $2,
      price = $3,
      stock_quantity = $4,
      media_urls = $5,
      category = $6
      WHERE id = $7
      RETURNING *;
    `;
    const values = [
      title,
      description,
      price,
      stock_quantity || 0,
      media_urls || [],
      category || "Electronics",
      id,
    ];

    const result = await db.query(queryText, values);

    if (result.rows.length === 0) {
      return next(
        new AppError("No product found matching that identity key.", 404),
      );
    }

    return res.status(200).json({
      success: true,
      message: "Product synced and updated successfully.",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("Database Error in Product Update:", err);
    return next(
      new AppError(
        "Internal server error occurred while syncing records.",
        500,
      ),
    );
  }
});

module.exports = router;
