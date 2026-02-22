import express from "express";
import {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
} from "../controllers/activity.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createActivity);
router.get("/", authMiddleware, getActivities);
router.get("/:id", authMiddleware, getActivityById);
router.patch("/:id", authMiddleware, updateActivity);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteActivity);

export default router;

// import express from "express";
// import {
//   createActivity,
//   getActivities,
//   getActivityById,
//   updateActivity,
//   deleteActivity,
// } from "../controllers/activity.controller.js";
// import { authMiddleware } from "../middlewares/auth.middleware.js";

// const router = express.Router();

// router.post("/", authMiddleware, createActivity);
// router.get("/", authMiddleware, getActivities);
// router.get("/:id", authMiddleware, getActivityById);
// router.patch("/:id", authMiddleware, updateActivity);
// router.delete("/:id", authMiddleware, deleteActivity);

// export default router;
 