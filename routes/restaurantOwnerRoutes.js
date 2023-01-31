// Package Imports
import express from "express";
// Middleware Imports

// Controller Imports
import { authResOwner } from "../controllers/restaurantOwnerController.js";

const router = express.Router();

router.post("/owner/auth", authResOwner);

export default router;
