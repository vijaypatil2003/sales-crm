import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";
import { ApiError, asyncHandler } from "../utils/apiHelper.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized request");
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid token");
    }

    req.user = user; // attach user to request
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
});
