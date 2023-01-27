// Package Imports
import express from "express";

// Middleware Imports

// Controller Imports
import { createNewAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.post("/new", createNewAdmin);

export default router;
