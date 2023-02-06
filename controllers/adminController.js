// Packages Import
import asyncHandler from "express-async-handler";

// Models Import
import Admin from "../models/adminModel.js";
import Users from "../models/userModel.js";
import Restaurant from "../models/restaurant/restaurantModel.js";
import ResOwner from "../models/restaurant/resOwnerModel.js";
import Reservation from "../models/restaurant/reservationModel.js";
import Menu from "../models/restaurant/menuModel.js";
import MenuItem from "../models/restaurant/menuItemModel.js";
import Cuisine from "../models/restaurant/cuisineModel.js";

// Functions Import
import { generateToken } from "../functions/tokenFunctions.js";

// Auth Controllers Start

// @desc Create new admin
// @route POST /api/v1/management/new
// @access Private/SuperAdmin
const createNewAdmin = asyncHandler(async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const checkIfAdminExist = await Admin.findOne({ email });

    if (checkIfAdminExist) {
      return res.status(400).json({ error: "This user is already an admin" });
    }

    const newAdmin = await Admin.create({
      fullName,
      email,
      password,
    });

    if (newAdmin) {
      return res.status(201).json({
        success: true,
        message: "New Admin created successfully",
      });
    } else {
      return res.status(400).json({
        error: "Something went wrong while creating new Admin",
      });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// @desc Authenticate admin
// @route POST /api/v1/management/auth
// @access Private
const authAdmin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      return res.status(200).json({
        success: true,
        access_token: generateToken(admin._id),
        admin_details: {
          id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          super_admin: admin.super_admin,
        },
      });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Auth Controllers End

// Restaurant Controllers Start

// @desc Create new restaurant
// @route POST /api/v1/management/restaurant/new
// @access Private/Admin
const createNewRestaurant = asyncHandler(async (req, res) => {
  try {
    const { name, cuisine, address, phoneNumber, openingHours, images } =
      req.body;

    if (
      !name ||
      !cuisine ||
      !address ||
      !phoneNumber ||
      !openingHours ||
      !images
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newRestaurant = await Restaurant.create({
      name,
      cuisine,
      address,
      phoneNumber,
      openingHours,
      images,
    });
    if (newRestaurant) {
      return res.status(201).json({
        success: true,
        message: "New Restaurant created successfully.",
        restaurant_details: newRestaurant,
      });
    } else {
      return res.status(201).json({
        error: "Something went wrong while creating new restaurant",
      });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// @desc Create new restaurant owner
// @route POST /api/v1/management/restaurant/owner/new
// @access Private/Admin
const createNewRestaurantOwner = asyncHandler(async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const checkIfResOwnerExist = await ResOwner.findOne({ email });

    if (checkIfResOwnerExist) {
      return res.status(400).json({
        error: "Restaurant owner already exist",
      });
    }

    const restaurantOwner = await ResOwner.create({
      fullName,
      email,
      password,
    });

    if (restaurantOwner) {
      return res.status(201).json({
        success: true,
        message: "New Restaurant owner created successfully",
      });
    } else {
      return res.status(400).json({
        error: "Something went wrong while creating new restaurant owner",
      });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// @desc Add a owner to a restaurant
// @route PATCH /api/v1/management/restaurant/:id/owner/add
// @access Private/Admin
const assignOwnerToRestaurant = asyncHandler(async (req, res) => {
  try {
    const { owner } = req.body;

    if (!owner) {
      return res.status(400).json({ error: "Owner is required" });
    }

    const resOwner = await ResOwner.findById(owner);

    if (!resOwner) {
      return res.status(404).json({ error: "Owner account not found" });
    }

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    restaurant.owner = owner;

    const updatedRestaurant = await restaurant.save();

    if (updatedRestaurant) {
      return res.status(200).json({ success: true, updatedRestaurant });
    } else {
      return res.status(400).json({
        error: "Something went wrong while adding a new owner to a restaurant",
      });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Restaurant Controllers End

// Dangerous Controllers Start

// @desc Wipe the database
// @route DELETE /api/v1/management/wipe-data
// @access Private/SuperAdmin
const wipeData = asyncHandler(async (req, res) => {
  try {
    const deleteResOwners = await ResOwner.deleteMany({});
    const deleteRestaurants = await Restaurant.deleteMany({});
    const deleteReservations = await Reservation.deleteMany({});
    const deleteMenus = await Menu.deleteMany({});
    const deleteMenuItems = await MenuItem.deleteMany({});
    const deleteAllUsers = await Users.deleteMany({});

    if (
      deleteAllUsers &&
      deleteMenuItems &&
      deleteMenus &&
      deleteReservations &&
      deleteRestaurants &&
      deleteResOwners
    ) {
      return res
        .status(200)
        .json({ success: true, message: "Data has been wiped" });
    } else {
      return res
        .status(400)
        .json({ error: "Something went wrong while wiping the data" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Dangerous Controllers End

// Cuisine Controllers Start

// @desc Create new admin
// @route POST /api/v1/management/new
// @access Private/Admin
const addNewCuisine = asyncHandler(async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name || !image) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const checkIfCuisineExist = await Cuisine.findOne({ name });

    if (checkIfCuisineExist) {
      return res.status(400).json({ error: "Cuisine already exist" });
    }

    const newCuisine = await Cuisine.create({
      name,
      image,
    });

    if (newCuisine) {
      return res.status(201).json({
        success: true,
        message: "New Cuisine added successfully",
      });
    } else {
      return res.status(400).json({
        error: "Something went wrong while adding new Cuisine",
      });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Cuisine Controllers End

export {
  createNewAdmin,
  authAdmin,
  createNewRestaurant,
  createNewRestaurantOwner,
  assignOwnerToRestaurant,
  addNewCuisine,
  wipeData,
};
