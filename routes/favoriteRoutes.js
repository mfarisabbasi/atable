// Package Imports
import express from "express";

// Middleware Imports
import { authMiddleware } from "../middlewares/authMiddleware.js";
// Controller Imports
import { addNewFavorite } from "../controllers/favoriteController.js";

const router = express.Router();

router.post("/new", authMiddleware, addNewFavorite);

export default router;
