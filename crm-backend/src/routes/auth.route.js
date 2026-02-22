import express from "express";
import {
  login,
  register,
  getMe,
  updateProfile,
  getAllUsers,
  deleteUser,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateProfile);
router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), deleteUser);

export default router;

// import express from "express";
// import {
//   login,
//   register,
//   getMe,
//   updateProfile,
//   getAllUsers,
//   deleteUser,
// } from "../controllers/auth.controller.js";
// import { authMiddleware } from "../middlewares/auth.middleware.js";

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);
// router.get("/me", authMiddleware, getMe);
// router.patch("/me", authMiddleware, updateProfile);
// router.get("/users", authMiddleware, getAllUsers);
// router.delete("/users/:id", authMiddleware, deleteUser);

// export default router;

