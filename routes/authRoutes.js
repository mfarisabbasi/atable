// Package Imports
import express from "express";

// Middleware Imports

// Controller Imports
import {
  createNewUserWithEmail,
  
} from "../controllers/authController.js";

const router = express.Router();

router.post("/new/email", createNewUserWithEmail);


export default router;
