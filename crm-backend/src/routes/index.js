import express from "express";
import authRoute from "./auth.route.js";
import leadRoute from "./lead.route.js";
import dealRoute from "./deal.route.js";
import activityRoute from "./activity.route.js";
import dashboardRoute from "./dashboard.route.js";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/leads", leadRoute);
router.use("/deals", dealRoute);
router.use("/activity", activityRoute);
router.use("/dashboard", dashboardRoute);

export default router;
