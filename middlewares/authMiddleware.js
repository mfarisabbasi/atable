// Packages Import
import asyncHandler from "express-async-handler";
// Models Import
import User from "../models/userModel.js";
import ResOwner from "../models/restaurant/resOwnerModel.js";
// Functions Import
import { verifyToken } from "../functions/tokenFunctions.js";
// Middlewares Import
import { authMiddlewareError } from "../constants/errorConstants.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header("auth-token");

    if (!token) {
      return res.status(401).json({ error: authMiddlewareError });
    }

    const verified = verifyToken(token);

    if (!verified) {
      return res.status(401).json({ error: authMiddlewareError });
    }

    const user = await User.findById(verified.id).select("-password");
    if (!user) {
      const resOwner = await ResOwner.findById(verified.id).select("-password");
      if (!resOwner) {
        return res.status(401).json({ error: authMiddlewareError });
      }
    }

    req.user = verified.id;

    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export { authMiddleware };
