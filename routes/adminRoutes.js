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
  wipeData,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/new", superAdminMiddleware, createNewAdmin);
router.post("/auth", authAdmin);
router.delete("/users/delete/all", superAdminMiddleware, deleteAllUsers);
router.delete("/wipe-data", superAdminMiddleware, wipeData);

// Admin Restaurants Manager
router.post("/restaurant/new", adminMiddleware, createNewRestaurant);
router.post("/restaurant/owner/new", adminMiddleware, createNewRestaurantOwner);
router.patch(
  "/restaurant/:id/owner/add",
  adminMiddleware,
  assignOwnerToRestaurant
);

export default router;
