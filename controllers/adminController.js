// Packages Import
import asyncHandler from "express-async-handler";

// Models Import
import Admin from "../models/adminModel.js";

// Functions Import
import { generateToken } from "../functions/tokenFunctions.js";

// @desc Create new admin
// @route POST /api/v1/management/new
// @access Private/Admin
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

// @desc Authenticate user with email and password
// @route POST /api/v1/auth/email
// @access Public
// const authUserWithEmailAndPassword = asyncHandler(async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     const user = await User.findOne({ email });

//     if (user && (await user.matchPassword(password))) {
//       res.status(200).json({
//         success: true,
//         access_token: generateToken(user._id),
//         user_details: {
//           id: user._id,
//           provider: user.provider,
//           fullName: user.fullName,
//           email: user.email,
//           email_verified: user.email_verified,
//           loyalty_count: newUser.loyalty_count,
//         },
//       });
//     } else {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }
//   } catch (error) {
//     return res.status(400).json({ error: error.message });
//   }
// });

export { createNewAdmin };
