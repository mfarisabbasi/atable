// Package Imports
import express from "express";
// Middleware Imports
import { authMiddleware } from "../middlewares/authMiddleware.js";
// Controller Imports
import {
  authResOwner,
  createNewMenu,
  createNewMenuItem,
} from "../controllers/restaurantOwnerController.js";

const router = express.Router();

router.post("/owner/auth", authResOwner);
router.post("/owner/menu/new", authMiddleware, createNewMenu);
router.post("/owner/menu/item/new", authMiddleware, createNewMenuItem);

export default router;
