// Package Imports
import express from "express";
// Middleware Imports

// Controller Imports
import {
  getAllRestaurants,
  getRecommended,
  getTodaysSpecial,
} from "../controllers/restaurantController.js";

const router = express.Router();

router.get("/all", getAllRestaurants);
router.get("/special", getTodaysSpecial);
router.get("/recommended", getRecommended);

export default router;
