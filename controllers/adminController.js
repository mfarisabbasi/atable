// Packages Import
import asyncHandler from "express-async-handler";

// Models Import
import Admin from "../models/adminModel.js";

// Functions Import
import { generateToken } from "../functions/tokenFunctions.js";

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
    res.status(400).json({ error: error.message });
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

export { createNewAdmin, authAdmin };
