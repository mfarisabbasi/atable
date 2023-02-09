// Package Imports
import express from "express";

// Middleware Imports
import { authMiddleware } from "../middlewares/authMiddleware.js";
// Controller Imports
import {
  addNewFavorite,
  getUserFavorites,
} from "../controllers/favoriteController.js";

const router = express.Router();

router.post("/new", authMiddleware, addNewFavorite);
router.get("/", authMiddleware, getUserFavorites);

export default router;
