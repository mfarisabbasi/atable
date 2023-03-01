// Package Imports
import express from "express";
// Middleware Imports
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkResOwner } from "../middlewares/checkRestaurantAdmin.js";
import { getTodayBookings,checkMonthlyReservation,
  disaplyReservationsRequest,
  approveReservationById
 } from "../controllers/restaurantOwnerController.js";
// Controller Imports
import {
  authResOwner,
  createNewMenu,
  createNewMenuItem,
  testResOwner,
} from "../controllers/restaurantOwnerController.js";

const router = express.Router();

router.post("/owner/auth", authResOwner);
router.post("/owner/menu/new", authMiddleware, createNewMenu);
router.post("/owner/menu/item/new", authMiddleware, createNewMenuItem);
router.get("/test", authMiddleware, testResOwner);
router.get("/owner/show/todayreservations",checkResOwner,getTodayBookings);
router.get("/owner/show/monthlyreservations",checkResOwner,checkMonthlyReservation);
router.get("/owner/show/allreservations",checkResOwner,disaplyReservationsRequest);
router.post("/owner/reservation/approve",checkResOwner,approveReservationById);
router.post("/owner/reservation/cancel",checkResOwner,cancelReservationById);
router.post("/owner/openslots/add",checkResOwner,addRestaurantOpeningSlots);
router.post("/owner/closeslots/add",checkResOwner,addRestaurantClosingSlots);
router.post("/owner/reservation/toggle/auto",checkResOwner,toggleAutoApprove);
router.post("/owner/reservation/auto",checkResOwner,autoApproveReservations);
router.post("/owner/reservation/add/tables",checkResOwner,addTables)
router.get("/owner/show/profile",checkResOwner,restaurantProfile)

export default router;
