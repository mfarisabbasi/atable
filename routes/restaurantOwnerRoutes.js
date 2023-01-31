// Package Imports
import express from "express";
// Middleware Imports

// Controller Imports
import {
  authResOwner,
  createNewMenu,
  createNewMenuItem,
} from "../controllers/restaurantOwnerController.js";

const router = express.Router();

router.post("/owner/auth", authResOwner);
router.post("/owner/menu/new", createNewMenu);
router.post("/owner/menu/item/new", createNewMenuItem);

export default router;
