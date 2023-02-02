// Package Imports
import express from "express";
// Middleware Imports

// Controller Imports
import {
  getAllRestaurants,
  getTodaysSpecial,
} from "../controllers/restaurantController.js";

const router = express.Router();

router.get("/all", getAllRestaurants);
router.get("/special", getTodaysSpecial);

export default router;
