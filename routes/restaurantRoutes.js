// Package Imports
import express from "express";
// Middleware Imports
import { authMiddleware } from "../middlewares/authMiddleware.js";
// Controller Imports
import {
  getAllRestaurants,
  getRecommended,
  getTodaysSpecial,
  newReview,
} from "../controllers/restaurantController.js";

const router = express.Router();

router.get("/all", getAllRestaurants);
router.get("/special", getTodaysSpecial);
router.get("/recommended", getRecommended);
router.post("/review/new", authMiddleware, newReview);

export default router;
