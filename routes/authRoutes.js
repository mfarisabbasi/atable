// Package Imports
import express from "express";

// Middleware Imports

// Controller Imports
import {
  createNewUserWithEmail,
  createNewUserWithGoogle,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/new/email", createNewUserWithEmail);
router.post("/new/google", createNewUserWithGoogle);

export default router;
