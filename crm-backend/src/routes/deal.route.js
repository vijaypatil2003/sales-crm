import express from "express";
import {
  createDeal,
  getDeals,
  getDealById,
  updateDeal,
  updateDealStage,
  deleteDeal,
} from "../controllers/deal.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createDeal);
router.get("/", authMiddleware, getDeals);
router.get("/:id", authMiddleware, getDealById);
router.patch("/:id/stage", authMiddleware, updateDealStage); // specific before generic
router.patch("/:id", authMiddleware, updateDeal);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteDeal);

export default router;

// import express from "express";
// import {
//   createDeal,
//   getDeals,
//   getDealById,
//   updateDeal,
//   updateDealStage,
//   deleteDeal,
// } from "../controllers/deal.controller.js";
// import { authMiddleware } from "../middlewares/auth.middleware.js";

// const router = express.Router();

// router.post("/", authMiddleware, createDeal);
// router.get("/", authMiddleware, getDeals);
// router.get("/:id", authMiddleware, getDealById);
// router.patch("/:id", authMiddleware, updateDeal);
// router.patch("/:id/stage", authMiddleware, updateDealStage);
// router.delete("/:id", authMiddleware, deleteDeal);

// export default router;
