// Package Imports
import express from "express";
// Middleware Imports

// Controller Imports
import {
  authResOwner,
  createNewMenu,
} from "../controllers/restaurantOwnerController.js";

const router = express.Router();

router.post("/owner/auth", authResOwner);
router.post("/owner/menu/new", createNewMenu);

export default router;
