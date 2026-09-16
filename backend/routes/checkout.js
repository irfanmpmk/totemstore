const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const db = require("../db");
const AppError = require("../utils/appError");

// POST /api/checkout/create-order - Prepare transactional environment
router.post("/create-order", async (req, res, next) => {
  // Senior Optimization: Destructure all fields cleanly at the entry point
  const {
    cartItems,
    userId,
    customerName,
    phone,
    pincode,
    locality,
    streetAddress,
    cityTown,
    state,
    addressType,
  } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return next(new AppError("Your shopping bag is completely empty.", 400));
  }

  try {
    let calculatedTotal = 0;
    const validatedItems = [];

    // Validate items directly against Database records to prevent frontend tampering
    for (const item of cartItems) {
      const productQuery =
        "SELECT id, price, stock_quantity FROM products WHERE id = $1;";
      const productResult = await db.query(productQuery, [item.id]);
      const dbProduct = productResult.rows[0];

      if (!dbProduct) {
        return next(new AppError(`Product matching verification failed.`, 404));
      }

      if (dbProduct.stock_quantity < item.quantity) {
        return next(
          new AppError(
            `Insufficient stock volume available for this item.`,
            400,
          ),
        );
      }

      calculatedTotal += parseFloat(dbProduct.price) * item.quantity;
      validatedItems.push({
        id: dbProduct.id,
        quantity: item.quantity,
        price: dbProduct.price,
      });
    }

    // Convert Rupees completely into Paise for Razorpay compatibility
    const amountInPaise = Math.round(calculatedTotal * 100);

    // --- SENIOR LAZY-INITIALIZATION & SANDBOX BYPASS ---
    let razorpayOrderId = `mock_order_${Date.now()}`;
    const isSandbox =
      !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.trim() === "";

    if (!isSandbox) {
      // Initialize the SDK ONLY when keys are actually provided in .env
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_rcpt_${Date.now()}`,
      };

      const razorpayOrder = await razorpay.orders.create(options);
      razorpayOrderId = razorpayOrder.id;
    }
    // ---------------------------------------------------

    // Persist the order inside PostgreSQL with an appropriate status flag
    const initialStatus = isSandbox ? "paid" : "pending";

    const insertOrderQuery = `
      INSERT INTO orders (
        user_id, razorpay_order_id, total_amount, status, 
        customer_name, phone_number, pincode, locality, 
        street_address, city_town, state, address_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id;
    `;

    // References the clean variable declarations from the top destructuring block
    const orderResult = await db.query(insertOrderQuery, [
      userId || null,
      razorpayOrderId,
      calculatedTotal,
      initialStatus,
      customerName,
      phone,
      pincode,
      locality,
      streetAddress,
      cityTown,
      state,
      addressType || "Home",
    ]);

    const internalOrderId = orderResult.rows[0].id;

    // Batch insert line items into order_items normalization table
    for (const item of validatedItems) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4);",
        [internalOrderId, item.id, item.quantity, item.price],
      );

      // If sandbox auto-pays, immediately decrement stock quantity in PostgreSQL
      if (isSandbox) {
        await db.query(
          "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2;",
          [item.quantity, item.id],
        );
      }
    }

    // Return transactional identifiers to the client app
    return res.status(201).json({
      success: true,
      isSandbox: isSandbox,
      keyId: process.env.RAZORPAY_KEY_ID || "sandbox_mode",
      amount: amountInPaise,
      currency: "INR",
      razorpayOrderId: razorpayOrderId,
    });
  } catch (error) {
    if (error.error && error.error.description) {
      return res.status(400).json({
        success: false,
        error: `Payment Gateway Error: ${error.error.description}`,
      });
    }
    next(error);
  }
});

module.exports = router;
