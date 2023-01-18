// Packages Import
import asyncHandler from "express-async-handler";
import { OAuth2Client } from "google-auth-library";

// Models Import
import User from "../models/userModel.js";

// Functions Import
import { generateToken } from "../functions/tokenFunctions.js";

// @desc Create New User With Email
// @route POST /api/v1/auth/new/email
// @access Public
const createNewUserWithEmail = asyncHandler(async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const checkIfUserExist = await User.findOne({ email });

    if (checkIfUserExist && checkIfUserExist.provider === "email") {
      return res.status(400).json({
        account_exist: true,
        provider: "email",
        error: "Account already exist",
      });
    }

    if (checkIfUserExist && checkIfUserExist.provider === "facebook") {
      return res.status(400).json({
        account_exist: true,
        provider: "facebook",
        error: "Account already exist using facebook provider",
      });
    }

    if (checkIfUserExist && checkIfUserExist.provider === "google") {
      return res.status(400).json({
        account_exist: true,
        provider: "google",
        error: "Account already exist using google provider",
      });
    }

    const newUser = await User.create({ fullName, email, password });

    if (newUser) {
      return res.status(201).json({
        success: true,
        access_token: generateToken(newUser._id),
        user: newUser._doc,
      });
    } else {
      return res.status(400).json({
        error:
          "Something went wrong while creating new user account with email",
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @desc Create New User With Google
// @route POST /api/v1/auth/new/google
// @access Public
const createNewUserWithGoogle = asyncHandler(async (req, res) => {
  try {
    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
      idToken: req.body.idToken,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (payload.email_verified) {
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export { createNewUserWithEmail, createNewUserWithGoogle };
