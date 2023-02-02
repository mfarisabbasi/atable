// Package Imports
import express from "express";

// Middleware Imports

// Controller Imports
import { getAllCuisines } from "../controllers/cuisineController.js";

const router = express.Router();

router.get("/all", getAllCuisines);

export default router;
