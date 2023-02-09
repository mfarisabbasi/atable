// Packages Import
import asyncHandler from "express-async-handler";

// Models Import
import Favorite from "../models/favoriteModel.js";
import Restaurant from "../models/restaurant/restaurantModel.js";

// @desc Add restaurant to favorites
// @route POST /api/v1/favorites/new
// @access Private
const addNewFavorite = asyncHandler(async (req, res) => {
  try {
    const { restaurantId } = req.body;

    const restaurant = await Restaurant.findOne({ _id: restaurantId });

    if (!restaurant)
      return res.status(404).json({ error: "Restaurant not found" });

    const existingFavorite = await Favorite.findOne({ user: req.user });
    if (existingFavorite) {
      const index = existingFavorite.favorites.indexOf(restaurantId);
      if (index !== -1) {
        existingFavorite.favorites.splice(index, 1);
        await existingFavorite.save();
        return res
          .status(200)
          .json({ success: true, message: "Removed from favorites" });
      } else {
        existingFavorite.favorites.push(restaurantId);
        await existingFavorite.save();
        return res
          .status(200)
          .json({ success: true, message: "Added to favorites" });
      }
    } else {
      const favorite = await Favorite.create({
        user: req.user,
        favorites: [restaurantId],
      });
      return res.status(201).json({ favorite });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// @desc Add restaurant to favorites
// @route GET /api/v1/favorites/
// @access Private
const getUserFavorites = asyncHandler(async (req, res) => {
  try {
    const favorites = await Favorite.findOne({ user: req.user }).populate({
      path: "favorites",
      select: "images name",
    });

    if (favorites) {
      return res.status(200).json({ success: true, favorites });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "You don't have any favorites" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export { addNewFavorite, getUserFavorites };
