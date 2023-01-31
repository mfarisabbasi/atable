// Package Imports
import express from "express";
// Middleware Imports
import {
  adminMiddleware,
  superAdminMiddleware,
} from "../middlewares/managementMiddlewares.js";
// Controller Imports
import {
  assignOwnerToRestaurant,
  authAdmin,
  createNewAdmin,
  createNewRestaurant,
  createNewRestaurantOwner,
  deleteAllUsers,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/new", superAdminMiddleware, createNewAdmin);
router.post("/auth", authAdmin);
router.delete("/users/delete/all", superAdminMiddleware, deleteAllUsers);

// Admin Restaurants Manager
router.post("/restaurant/new", adminMiddleware, createNewRestaurant);
router.post("/restaurant/owner/new", adminMiddleware, createNewRestaurantOwner);
router.patch(
  "/restaurant/:id/owner/add",
  adminMiddleware,
  assignOwnerToRestaurant
);

export default router;
