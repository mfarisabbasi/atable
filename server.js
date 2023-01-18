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

// API End

// Server Start

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server Running In ${process.env.NODE_ENV} On PORT ${PORT}`)
);
