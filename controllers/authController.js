// Packages Import
import asyncHandler from "express-async-handler";
import crypto from "crypto";

// Models Import
import User from "../models/userModel.js";

// Functions Import
import {
  generateEmailVerificationToken,
  generateToken,
} from "../functions/tokenFunctions.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../functions/emailFunctions.js";

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

    const newUser = await User.create({
      fullName,
      email,
      password,
      activationToken: generateEmailVerificationToken(),
    });

    if (newUser) {
      const activateUrl = `http://127.0.0.1:6000/api/v1/auth/email/verify/${newUser.activationToken}`;

      sendVerificationEmail(newUser.email, activateUrl);

      return res.status(201).json({
        success: true,
        user_details: {
          id: newUser._id,
          provider: newUser.provider,
          fullName: newUser.fullName,
          email: newUser.email,
          activationToken: newUser.activationToken,
          email_verified: newUser.email_verified,
          loyalty_count: newUser.loyalty_count,
        },
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

// @desc Verify user email
// @route PATCH /api/v1/auth/email/verify/:token
// @access Public
const verifyUserEmail = asyncHandler(async (req, res) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({ activationToken: token });

    if (!user) {
      return res.status(400).json({ error: "Token is invalid or expired" });
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
    return res.status(400).json({ error: error.message });
  }
});

// @desc Forgot Password
// @route POST /api/v1/auth/email/forgot
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ error: "No account found" });
    }

    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBefore: false });

    const resetUrl = `http://127.0.0.1:6000/api/v1/auth/email/forgot/${resetToken}`;

    try {
      sendPasswordResetEmail(user.email, resetUrl);
      return res.status(200).json({
        success: true,
        message: "We've sent you a link to reset your password",
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBefore: false });
      return res
        .status(400)
        .json({ error: "Error sending password reset email" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// @desc Reset Password
// @route PATCH /api/v1/auth/email/reset/:token
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const userBasedOnToken = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!userBasedOnToken) {
      return res.status(400).json({ error: "Token is invalid or expired" });
    }

    userBasedOnToken.password = req.body.password;
    userBasedOnToken.passwordResetToken = undefined;
    userBasedOnToken.passwordResetExpires = undefined;

    const passwordChanged = await userBasedOnToken.save();

    if (passwordChanged) {
      return res
        .status(200)
        .json({ success: true, message: "Password successfully changed" });
    } else {
      return res
        .status(400)
        .json({ error: "Something went wrong while resetting password" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
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
      return res.status(200).json({
        success: true,
        access_token: generateToken(user._id),
        user_details: {
          id: user._id,
          provider: user.provider,
          fullName: user.fullName,
          email: user.email,
          email_verified: user.email_verified,
          loyalty_count: user.loyalty_count,
        },
      });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export {
  createNewUserWithEmail,
  authUserWithEmailAndPassword,
  verifyUserEmail,
  forgotPassword,
  resetPassword,
};
