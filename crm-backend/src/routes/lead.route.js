import express from "express";
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  reassignLead,
} from "../controllers/lead.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createLead);
router.get("/", authMiddleware, getLeads);
router.get("/:id", authMiddleware, getLeadById);
router.patch("/:id", authMiddleware, updateLead);
router.patch("/:id/reassign", authMiddleware, roleMiddleware("admin"), reassignLead);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteLead);

export default router;


// import express from "express";
// import {
//   createLead,
//   getLeads,
//   getLeadById,
//   updateLead,
//   deleteLead,
//   reassignLead,
// } from "../controllers/lead.controller.js";
// import { authMiddleware } from "../middlewares/auth.middleware.js";

// const router = express.Router();

// router.post("/", authMiddleware, createLead);
// router.get("/", authMiddleware, getLeads);
// router.get("/:id", authMiddleware, getLeadById);
// router.patch("/:id", authMiddleware, updateLead);
// router.patch("/:id/reassign", authMiddleware, reassignLead);
// router.delete("/:id", authMiddleware, deleteLead);

// export default router;
