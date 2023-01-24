// Package Imports
import express from "express";

// Middleware Imports

// Controller Imports
import {
  authUserWithEmailAndPassword,
  createNewUserWithEmail,
  verifyUserEmail,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/new/email", createNewUserWithEmail);
router.post("/email", authUserWithEmailAndPassword);
router.patch("/email/verify/:token", verifyUserEmail);

export default router;
