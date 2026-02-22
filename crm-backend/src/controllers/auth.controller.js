import mongoose from "mongoose";
import User from "../models/auth.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/apiHelper.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  if (name.trim().length < 2) {
    throw new ApiError(400, "Name must be at least 2 characters");
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashPassword,
    role: "sales", // role is always sales on register, admin is set manually
  });

  const userResponse = user.toObject();
  delete userResponse.password;

  return res
    .status(201)
    .json(new ApiResponse(201, userResponse, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const userResponse = user.toObject();
  delete userResponse.password;

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: userResponse, token }, "Login successful")
    );
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name && !email && !password) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (name && name.trim().length < 2) {
    throw new ApiError(400, "Name must be at least 2 characters");
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new ApiError(409, "Email already in use");
    }
  }

  if (password && password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  user.name = name ? name.trim() : user.name;
  user.email = email || user.email;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  return res
    .status(200)
    .json(new ApiResponse(200, userResponse, "Profile updated successfully"));
});

// Admin only
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

// Admin only
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (id === req.user.id.toString()) {
    throw new ApiError(400, "You cannot delete yourself");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await user.deleteOne();

  return res
    .status(204)
    .json(new ApiResponse(204, null, "User deleted successfully"));
});

// import User from "../models/auth.model.js";
// import { ApiError, ApiResponse, asyncHandler } from "../utils/apiHelper.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// export const register = asyncHandler(async (req, res) => {
//   const { name, email, password, role } = req.body;

//   if (!name || !email || !password) {
//     throw new ApiError(400, "All fields are required");
//   }

//   if (!/^\S+@\S+\.\S+$/.test(email)) {
//     throw new ApiError(400, "Invalid email format");
//   }

//   if (password.length < 6) {
//     throw new ApiError(400, "Password must be at least 6 characters");
//   }

//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     throw new ApiError(409, "User already exists");
//   }

//   const hashPassword = await bcrypt.hash(password, 10);

//   const user = await User.create({
//     name,
//     email,
//     password: hashPassword,
//     role: role === "admin" ? "sales" : role || "sales",
//   });

//   const userResponse = user.toObject();
//   delete userResponse.password;

//   return res
//     .status(201)
//     .json(new ApiResponse(201, userResponse, "User registered successfully"));
// });

// export const login = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     throw new ApiError(400, "Email and password are required");
//   }

//   const user = await User.findOne({ email });
//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) {
//     throw new ApiError(401, "Invalid credentials");
//   }

//   const token = jwt.sign(
//     { id: user._id, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" },
//   );

//   const userResponse = user.toObject();
//   delete userResponse.password;

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, { user: userResponse, token }, "Login successful"),
//     );
// });

// export const getMe = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id).select("-password");

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "Profile fetched successfully"));
// });

// export const updateProfile = asyncHandler(async (req, res) => {
//   const { name, email, password } = req.body;

//   const user = await User.findById(req.user.id);

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   if (email && !/^\S+@\S+\.\S+$/.test(email)) {
//     throw new ApiError(400, "Invalid email format");
//   }

//   if (email && email !== user.email) {
//     const existing = await User.findOne({ email });
//     if (existing) {
//       throw new ApiError(409, "Email already in use");
//     }
//   }

//   if (password && password.length < 6) {
//     throw new ApiError(400, "Password must be at least 6 characters");
//   }

//   user.name = name || user.name;
//   user.email = email || user.email;

//   if (password) {
//     user.password = await bcrypt.hash(password, 10);
//   }

//   await user.save();

//   const userResponse = user.toObject();
//   delete userResponse.password;

//   return res
//     .status(200)
//     .json(new ApiResponse(200, userResponse, "Profile updated successfully"));
// });

// // Admin only
// export const getAllUsers = asyncHandler(async (req, res) => {
//   if (req.user.role !== "admin") {
//     throw new ApiError(403, "Access denied");
//   }

//   const users = await User.find().select("-password").sort({ createdAt: -1 });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, users, "Users fetched successfully"));
// });

// // Admin only
// export const deleteUser = asyncHandler(async (req, res) => {
//   if (req.user.role !== "admin") {
//     throw new ApiError(403, "Access denied");
//   }

//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, "Invalid user ID");
//   }

//   if (id === req.user.id) {
//     throw new ApiError(400, "You cannot delete yourself");
//   }

//   const user = await User.findById(id);

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   await user.deleteOne();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, null, "User deleted successfully"));
// });

// // import User from "../models/auth.model.js";
// // import { ApiError, ApiResponse, asyncHandler } from "../utils/apiHelper.js";
// // import bcrypt from "bcryptjs";
// // import jwt from "jsonwebtoken";

// // export const register = asyncHandler(async (req, res) => {
// //   const { name, email, password } = req.body;

// //   if (!name || !email || !password) {
// //     throw new ApiError(400, "Required field missing");
// //   }

// //   const existingUser = await User.findOne({ email });
// //   if (existingUser) {
// //     throw new ApiError(400, "User Already Exist");
// //   }

// //   const hashPassword = await bcrypt.hash(password, 10);
// //   const user = await User.create({
// //     name,
// //     email,
// //     password: hashPassword,
// //   });

// //   return res
// //     .status(201)
// //     .json(new ApiResponse(201, user, "User registered successfully"));
// // });

// // export const login = asyncHandler(async (req, res) => {
// //   const { email, password } = req.body;

// //   if (!email || !password) {
// //     throw new ApiError(400, "Required field missing");
// //   }

// //   const user = await User.findOne({ email });
// //   if (!user) {
// //     throw new ApiError(404, "User Not Found");
// //   }

// //   const isMatch = await bcrypt.compare(password, user.password);
// //   if (!isMatch) {
// //     throw new ApiError(401, "Invalid credentials");
// //   }

// //   const token = jwt.sign(
// //     { id: user._id, role: user.role },
// //     process.env.JWT_SECRET,
// //     { expiresIn: "7d" },
// //   );
// //   return res
// //     .status(200)
// //     .json(new ApiResponse(200, { user, token }, "Login successful"));
// // });
