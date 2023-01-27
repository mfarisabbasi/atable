import asyncHandler from "express-async-handler";
import Admin from "../models/adminModel.js";
import { verifyToken } from "../functions/tokenFunctions.js";
import { superAdminMiddlewareError } from "../constants/superAdminConstants.js";

const superAdminMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header("auth-token");

    if (!token) {
      return res.status(401).json({ error: superAdminMiddlewareError });
    }

    const verified = verifyToken(token);

    if (!verified) {
      return res.status(401).json({ error: superAdminMiddlewareError });
    }

    const superAdmin = await Admin.findById(verified.id).select("-password");
    if (!superAdmin || superAdmin.super_admin === false) {
      return res.status(401).json({ error: superAdminMiddlewareError });
    }

    req.user = verified.id;

    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export { superAdminMiddleware };
