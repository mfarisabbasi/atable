// Package Imports
import express from "express";
// Middleware Imports
import { superAdminMiddleware } from "../middlewares/managementMiddlewares.js";
// Controller Imports
import { authAdmin, createNewAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.post("/new", superAdminMiddleware, createNewAdmin);
router.post("/auth", authAdmin);

export default router;
