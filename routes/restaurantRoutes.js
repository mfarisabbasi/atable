// Package Imports
import express from "express";
// Middleware Imports

// Controller Imports
import { getAllRestaurants } from "../controllers/restaurantController.js";

const router = express.Router();

router.get("/all", getAllRestaurants);

export default router;
