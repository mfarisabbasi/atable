// Packages Import
import asyncHandler from "express-async-handler";
import crypto from "crypto";

// Models Import
import Cuisine from "../models/restaurant/cuisineModel.js";

// @desc Get all cuisines
// @route GET /api/v1/cuisine/all
// @access Public
const getAllCuisines = asyncHandler(async (req, res) => {
  try {
    const cuisines = await Cuisine.find({});

    if (cuisines) {
      return res.status(200).json({ success: true, cuisines });
    } else {
      return res
        .status(400)
        .json({ error: "Something went wrong while getting cuisines" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export { getAllCuisines };
