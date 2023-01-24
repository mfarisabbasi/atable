// Packages Import
import asyncHandler from "express-async-handler";

// Models Import
import User from "../models/userModel.js";

// Functions Import
import {
  generateEmailVerificationToken,
  generateToken,
} from "../functions/tokenFunctions.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../functions/emailFunctions.js";

// @desc Create New User With Email
// @route POST /api/v1/auth/new/email
// @access Public
const createNewUserWithEmail = asyncHandler(async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const checkIfUserExist = await User.findOne({ email });

    const checkIfUserExistWithSamePhoneNumber = await User.findOne({
      phoneNumber,
    });

    if (checkIfUserExistWithSamePhoneNumber) {
      return res.status(400).json({
        account_exist: true,
        error: "Account already exist with this phone number",
      });
    }

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

    const newUser = await User.create({
      fullName,
      email,
      phoneNumber,
      password,
      activationToken: generateEmailVerificationToken(),
    });

    if (newUser) {
      const activateUrl = `http://127.0.0.1:6000/api/v1/auth/email/verify/${newUser.activationToken}`;

      sendVerificationEmail(newUser.email, activateUrl);

      return res.status(201).json({
        success: true,
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

// @desc Authenticate user with email and password
// @route POST /api/v1/auth/email
// @access Public
const authUserWithEmailAndPassword = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        success: true,
        access_token: generateToken(user._id),
        user_details: user._doc,
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @desc Verify user email
// @route PATCH /api/v1/auth/email/verify/:token
// @access Public
const verifyUserEmail = asyncHandler(async (req, res) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({ activationToken: token });

    if (!user) {
      res.status(400).json({ error: "Token is invalid or expired" });
    }

    user.email_verified = true;
    user.activationToken = undefined;

    await user.save();

    try {
      sendWelcomeEmail(user.email, user.fullName);
      return res.status(200).json({
        success: true,
        message: "Account Activated, Welcome email sent",
      });
    } catch (error) {
      user.activationToken = undefined;
      return res.status(500).json({
        success: false,
        message: "Something went wrong while verifying user's email",
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export {
  createNewUserWithEmail,
  authUserWithEmailAndPassword,
  verifyUserEmail,
};
