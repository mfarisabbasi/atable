// Package Imports
import express from "express";

// Middleware Imports

// Controller Imports
import {
  authUserWithEmailAndPassword,
  createNewUserWithEmail,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/new/email", createNewUserWithEmail);
router.post("/email", authUserWithEmailAndPassword);

export default router;
