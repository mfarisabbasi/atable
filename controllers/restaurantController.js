// Packages Import
import asyncHandler from "express-async-handler";

// Models Import
import Restaurant from "../models/restaurant/restaurantModel.js";

// @desc Get all restaurants
// @route GET /api/v1/restaurants/all
// @access Public
const getAllRestaurants = asyncHandler(async (req, res) => {
  try {
    const restaurants = await Restaurant.find({}).populate({
      path: "menu",
      model: "Menu",
    });

    if (restaurants) {
      return res.status(200).json({ success: true, restaurants });
    } else {
      return res
        .status(400)
        .json({ error: "Something went wrong while getting all restaurants" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// @desc Get Today's special - returns the restaurants with premium and advanced subscription
// @route GET /api/v1/restaurants/special
// @access Public
const getTodaysSpecial = asyncHandler(async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      subscription: { $in: ["Premium", "Advanced"] },
    }).populate({
      path: "menu",
      model: "Menu",
    });

    if (restaurants) {
      return res.status(200).json({ success: true, restaurants });
    } else {
      return res
        .status(400)
        .json({ error: "Something went wrong while getting today's special" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export { getAllRestaurants, getTodaysSpecial };
