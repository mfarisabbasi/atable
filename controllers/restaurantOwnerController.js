// Packages Import
import asyncHandler from "express-async-handler";

// Models Import
import ResOwner from "../models/restaurant/resOwnerModel.js";
import Restaurant from "../models/restaurant/restaurantModel.js";
import Menu from "../models/restaurant/menuModel.js";
import MenuItem from "../models/restaurant/menuItemModel.js";

// Functions Import
import { generateToken } from "../functions/tokenFunctions.js";

// @desc Authenticate restaurant owner
// @route POST /api/v1/restaurant/owner/auth
// @access Private/RestaurantOwners
const authResOwner = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const resOwner = await ResOwner.findOne({ email });

    if (resOwner && (await resOwner.matchPassword(password))) {
      return res.status(200).json({
        success: true,
        access_token: generateToken(resOwner._id),
        resOwner_details: {
          id: resOwner._id,
          fullName: resOwner.fullName,
          restaurants: resOwner.restaurants,
          email: resOwner.email,
        },
      });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// @desc Create a new menu
// @route POST /api/v1/restaurant/owner/menu/new
// @access Private/RestaurantOwners
const createNewMenu = asyncHandler(async (req, res) => {
  try {
    const { name, items, restaurant } = req.body;

    if (!name || !restaurant) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const checkIfRestaurantExist = await Restaurant.findOne({
      _id: restaurant,
    });

    if (!checkIfRestaurantExist) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const newMenu = await Menu.create({
      name,
      items,
      restaurant,
    });

    if (newMenu) {
      return res.status(201).json({ success: true, menu_details: newMenu });
    } else {
      return res
        .status(201)
        .json({ error: "Something went wrong while creating new menu" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// @desc Create a new menu item
// @route POST /api/v1/restaurant/owner/menu/item/new
// @access Private/RestaurantOwners
const createNewMenuItem = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, menu } = req.body;

    if (!name || !description || !price || !menu) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const checkIfMenuExist = await Menu.findOne({
      _id: menu,
    });

    if (!checkIfMenuExist) {
      return res.status(404).json({ error: "Menu not found" });
    }

    const newMenuItem = await MenuItem.create({
      name,
      description,
      price,
      menu,
    });

    if (!newMenuItem) {
      return res
        .status(400)
        .json({ error: "Something went wrong while creating new menu item" });
    }

    const updatedMenu = await Menu.findByIdAndUpdate(
      menu,
      { $push: { items: newMenuItem._id } },
      { new: true }
    ).populate("items");

    if (updatedMenu) {
      return res.status(200).json({ success: true, menu_details: updatedMenu });
    } else {
      return res
        .status(400)
        .json({ error: "Something went wrong while updating the menu" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export { authResOwner, createNewMenu, createNewMenuItem };
