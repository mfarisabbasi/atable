// Package Imports Start

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Package Imports End

// Config Imports Start

import connectDB from "./configs/db.js";

// Config Imports End

// Middlware Imports Start

import morgan from "morgan";

// Middlware Imports End

// Route Imports Start

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import restaurantOwnerRoutes from "./routes/restaurantOwnerRoutes.js";
import cuisineRoutes from "./routes/cuisineRoutes.js";

// Route Imports End

// Basic Inits Start

dotenv.config();

connectDB();

const app = express();

// Basic Inits End

// Middleware Usage Start

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use(cors());

// Middleware Usage End

// API Start

app.get("/api/v1/", (req, res) => {
  res.send("API is runnung");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/management", adminRoutes);
app.use("/api/v1/restaurants", restaurantRoutes);
app.use("/api/v1/restaurant", restaurantOwnerRoutes);
app.use("/api/v1/cuisine", cuisineRoutes);

// API End

// Server Start

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server Running In ${process.env.NODE_ENV} On PORT ${PORT}`)
);
