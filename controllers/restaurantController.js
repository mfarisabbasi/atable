// Packages Import
import asyncHandler from "express-async-handler";

// Functions Import
import { shuffleArray } from "../functions/basicFunctions.js";

// Models Import
import Restaurant from "../models/restaurant/restaurantModel.js";

// Home Screen Controllers Start

// @desc Get all restaurants
// @route GET /api/v1/restaurants/all
// @access Public
const getAllRestaurants = asyncHandler(async (req, res) => {
  try {
    const restaurants = await Restaurant.find({})
      .populate({
        path: "menu",
        model: "Menu",
      })
      .populate({ path: "cuisine", model: "Cuisine" });

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
    })
      .select("-owner")
      .populate({
        path: "menu",
        model: "Menu",
      })
      .populate({ path: "cuisine", model: "Cuisine" });

    const shuffleRestaurants = shuffleArray(restaurants);

    if (restaurants) {
      return res
        .status(200)
        .json({ success: true, restaurants: shuffleRestaurants });
    } else {
      return res
        .status(400)
        .json({ error: "Something went wrong while getting today's special" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// @desc Get Recommended For You - returns 5 random restaurants
// @route GET /api/v1/restaurants/recommended
// @access Public
const getRecommended = asyncHandler(async (req, res) => {
  try {
    const restaurants = await Restaurant.aggregate([{ $sample: { size: 10 } }]);

    const populatedRestaurants = await Restaurant.populate(restaurants, {
      path: "cuisine menu",
    });

    if (populatedRestaurants) {
      return res.status(200).json({ success: true, populatedRestaurants });
    } else {
      return res.status(400).json({
        error: "Something went wrong while getting recommended restaurants",
      });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Home Screen Controllers End

// Basic Restaurant Controllers Start

// @desc Fetch Single Restaurant By ID
// @route GET /api/v1/restaurants/:id
// @access Public
const getSingleRestaurantById = asyncHandler(async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "cuisine menu"
    );

    if (restaurant) {
      return res.status(200).json({ success: true, restaurant });
    } else {
      return res.status(400).json({ error: "Restaurant not found" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Basic Restaurant Controllers End

// Reviews Controllers Start

// @desc Give a review to a restaurant
// @route POST /api/v1/restaurants/review/new
// @access Public
const newReview = asyncHandler(async (req, res) => {
  try {
    const { restaurantId, rating } = req.body;

    if (!restaurantId || !rating) {
      return res
        .status(400)
        .json({ error: "restaurantId & rating is required" });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const alreadyReviewed = restaurant.reviews.find(
      (r) => r.user.toString() === req.user.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ error: "Restaurant already reviewed" });
    }

    const newReview = {
      user: req.user,
      rating: Number(rating),
    };

    restaurant.reviews.push(newReview);
    restaurant.totalRatings = restaurant.reviews.length;
    restaurant.rating =
      restaurant.reviews.reduce((acc, item) => item.rating + acc, 0) /
      restaurant.reviews.length;

    const ratingCompleted = await restaurant.save();

    if (ratingCompleted) {
      return res.status(201).json({
        success: true,
        message: "Thank you for reviewing the restaurant",
      });
    } else {
      return res
        .status(400)
        .json({ error: "Something went wrong while creating new review" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Reviews Controllers End

export {
  getAllRestaurants,
  getTodaysSpecial,
  getRecommended,
  getSingleRestaurantById,
  newReview,
};
