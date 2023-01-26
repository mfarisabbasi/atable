// Package Imports
import express from "express";

// Middleware Imports

// Controller Imports
import {
  authUserWithEmailAndPassword,
  createNewUserWithEmail,
  forgotPassword,
  resetPassword,
  verifyUserEmail,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/new/email", createNewUserWithEmail);
router.post("/email", authUserWithEmailAndPassword);
router.post("/email/forgot", forgotPassword);
router.patch("/email/reset/:token", resetPassword);
router.patch("/email/verify/:token", verifyUserEmail);

export default router;
