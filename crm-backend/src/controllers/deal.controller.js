import mongoose from "mongoose";
import Deal from "../models/deal.model.js";
import Lead from "../models/lead.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/apiHelper.js";

const isValidDate = (date) => !isNaN(new Date(date).getTime());

export const createDeal = asyncHandler(async (req, res) => {
  const { leadId, amount, closeDate } = req.body;

  if (!leadId) {
    throw new ApiError(400, "leadId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError(400, "Invalid Lead ID");
  }

  if (amount === undefined || amount === null) {
    throw new ApiError(400, "Amount is required");
  }

  if (amount <= 0) {
    throw new ApiError(400, "Amount must be greater than 0");
  }

  if (closeDate && !isValidDate(closeDate)) {
    throw new ApiError(400, "Invalid closeDate format");
  }

  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  if (req.user.role !== "admin" && lead.assignedTo.toString() !== req.user.id) {
    throw new ApiError(403, "You cannot create a deal for this lead");
  }

  const deal = await Deal.create({
    lead: leadId,
    amount,
    closeDate: closeDate || null,
    stage: "Prospect",
  });

  const populatedDeal = await Deal.findById(deal._id).populate(
    "lead",
    "name company status"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedDeal, "Deal created successfully"));
});

export const getDeals = asyncHandler(async (req, res) => {
  const { leadId, stage } = req.query;

  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const skip = (page - 1) * limit;

  const allowedStages = ["Prospect", "Negotiation", "Won", "Lost"];

  let filter = {};

  if (stage) {
    if (!allowedStages.includes(stage)) {
      throw new ApiError(400, "Invalid stage value");
    }
    filter.stage = stage;
  }

  if (req.user.role !== "admin") {
    const userLeads = await Lead.find({ assignedTo: req.user.id }).select(
      "_id"
    );
    const leadIds = userLeads.map((l) => l._id);

    if (leadId) {
      if (!mongoose.Types.ObjectId.isValid(leadId)) {
        throw new ApiError(400, "Invalid Lead ID");
      }

      const hasAccess = leadIds.some((lid) => lid.toString() === leadId);
      if (!hasAccess) {
        throw new ApiError(403, "You cannot access deals for this lead");
      }

      filter.lead = leadId;
    } else {
      filter.lead = { $in: leadIds };
    }
  } else {
    if (leadId) {
      if (!mongoose.Types.ObjectId.isValid(leadId)) {
        throw new ApiError(400, "Invalid Lead ID");
      }

      const lead = await Lead.findById(leadId);
      if (!lead) {
        throw new ApiError(404, "Lead not found");
      }

      filter.lead = leadId;
    }
  }

  const totalItems = await Deal.countDocuments(filter);

  const deals = await Deal.find(filter)
    .populate("lead", "name company status assignedTo")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalItems / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      { deals, page, limit, totalPages, totalItems },
      "Deals fetched successfully"
    )
  );
});

export const getDealById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Deal ID");
  }

  const deal = await Deal.findById(id).populate(
    "lead",
    "name company status assignedTo"
  );

  if (!deal) {
    throw new ApiError(404, "Deal not found");
  }

  if (
    req.user.role !== "admin" &&
    deal.lead.assignedTo.toString() !== req.user.id
  ) {
    throw new ApiError(403, "Access denied");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deal, "Deal fetched successfully"));
});

export const updateDealStage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;

  const allowedStages = ["Prospect", "Negotiation", "Won", "Lost"];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Deal ID");
  }

  if (!stage) {
    throw new ApiError(400, "Stage is required");
  }

  if (!allowedStages.includes(stage)) {
    throw new ApiError(400, "Invalid stage value");
  }

  const deal = await Deal.findById(id).populate("lead");

  if (!deal) {
    throw new ApiError(404, "Deal not found");
  }

  if (
    req.user.role !== "admin" &&
    deal.lead.assignedTo.toString() !== req.user.id
  ) {
    throw new ApiError(403, "You cannot update this deal");
  }

  deal.stage = stage;

  if (stage === "Won" && !deal.closeDate) {
    deal.closeDate = new Date();
  }

  await deal.save();

  const updatedDeal = await Deal.findById(deal._id).populate(
    "lead",
    "name company status"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedDeal, "Deal stage updated successfully")
    );
});

export const updateDeal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, closeDate } = req.body;

  if (amount === undefined && closeDate === undefined) {
    throw new ApiError(400, "At least one field is required to update");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Deal ID");
  }

  const deal = await Deal.findById(id).populate("lead");

  if (!deal) {
    throw new ApiError(404, "Deal not found");
  }

  if (
    req.user.role !== "admin" &&
    deal.lead.assignedTo.toString() !== req.user.id
  ) {
    throw new ApiError(403, "You cannot update this deal");
  }

  if (amount !== undefined) {
    if (amount <= 0) {
      throw new ApiError(400, "Amount must be greater than 0");
    }
    deal.amount = amount;
  }

  if (closeDate !== undefined) {
    if (!isValidDate(closeDate)) {
      throw new ApiError(400, "Invalid closeDate format");
    }
    deal.closeDate = closeDate;
  }

  await deal.save();

  const updatedDeal = await Deal.findById(deal._id).populate(
    "lead",
    "name company status"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedDeal, "Deal updated successfully"));
});

// Admin only
export const deleteDeal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Deal ID");
  }

  const deal = await Deal.findById(id);

  if (!deal) {
    throw new ApiError(404, "Deal not found");
  }

  await deal.deleteOne();

  return res
    .status(204)
    .json(new ApiResponse(204, null, "Deal deleted successfully"));
});


// import mongoose from "mongoose";

// import Deal from "../models/deal.model.js";
// import Lead from "../models/lead.model.js";
// import { ApiError, ApiResponse, asyncHandler } from "../utils/apiHelper.js";

// export const createDeal = asyncHandler(async (req, res) => {
//   const { leadId, amount, closeDate } = req.body;

//   if (!leadId) {
//     throw new ApiError(400, "leadId is required");
//   }

//   if (!mongoose.Types.ObjectId.isValid(leadId)) {
//     throw new ApiError(400, "Invalid Lead ID");
//   }

//   if (!amount || amount <= 0) {
//     throw new ApiError(400, "Amount must be greater than 0");
//   }

//   const lead = await Lead.findById(leadId);

//   if (!lead) {
//     throw new ApiError(404, "Lead not found");
//   }

//   if (req.user.role !== "admin" && lead.assignedTo.toString() !== req.user.id) {
//     throw new ApiError(403, "You cannot create a deal for this lead");
//   }

//   const existingDeal = await Deal.findOne({ lead: leadId });
//   if (existingDeal) {
//     throw new ApiError(409, "A deal already exists for this lead");
//   }

//   const deal = await Deal.create({
//     lead: leadId,
//     amount,
//     closeDate: closeDate || null,
//     stage: "Prospect",
//   });

//   const populatedDeal = await Deal.findById(deal._id).populate(
//     "lead",
//     "name company status",
//   );

//   return res
//     .status(201)
//     .json(new ApiResponse(201, populatedDeal, "Deal created successfully"));
// });

// export const getDeals = asyncHandler(async (req, res) => {
//   const { leadId, stage } = req.query;

//   const allowedStages = ["Prospect", "Negotiation", "Won", "Lost"];

//   let filter = {};

//   if (stage) {
//     if (!allowedStages.includes(stage)) {
//       throw new ApiError(400, "Invalid stage value");
//     }
//     filter.stage = stage;
//   }

//   if (req.user.role !== "admin") {
//     const userLeads = await Lead.find({ assignedTo: req.user.id }).select(
//       "_id",
//     );
//     const leadIds = userLeads.map((l) => l._id);

//     if (leadId) {
//       if (!mongoose.Types.ObjectId.isValid(leadId)) {
//         throw new ApiError(400, "Invalid Lead ID");
//       }

//       const hasAccess = leadIds.some((lid) => lid.toString() === leadId);
//       if (!hasAccess) {
//         throw new ApiError(403, "You cannot access deals for this lead");
//       }

//       filter.lead = leadId;
//     } else {
//       filter.lead = { $in: leadIds };
//     }
//   } else {
//     if (leadId) {
//       if (!mongoose.Types.ObjectId.isValid(leadId)) {
//         throw new ApiError(400, "Invalid Lead ID");
//       }

//       const lead = await Lead.findById(leadId);
//       if (!lead) {
//         throw new ApiError(404, "Lead not found");
//       }

//       filter.lead = leadId;
//     }
//   }

//   const deals = await Deal.find(filter)
//     .populate("lead", "name company status assignedTo")
//     .sort({ createdAt: -1 });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, deals, "Deals fetched successfully"));
// });

// export const getDealById = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, "Invalid Deal ID");
//   }

//   const deal = await Deal.findById(id).populate(
//     "lead",
//     "name company status assignedTo",
//   );

//   if (!deal) {
//     throw new ApiError(404, "Deal not found");
//   }

//   if (
//     req.user.role !== "admin" &&
//     deal.lead.assignedTo.toString() !== req.user.id
//   ) {
//     throw new ApiError(403, "Access denied");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, deal, "Deal fetched successfully"));
// });

// export const updateDealStage = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { stage } = req.body;

//   const allowedStages = ["Prospect", "Negotiation", "Won", "Lost"];

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, "Invalid Deal ID");
//   }

//   if (!stage) {
//     throw new ApiError(400, "Stage is required");
//   }

//   if (!allowedStages.includes(stage)) {
//     throw new ApiError(400, "Invalid stage value");
//   }

//   const deal = await Deal.findById(id).populate("lead");

//   if (!deal) {
//     throw new ApiError(404, "Deal not found");
//   }

//   if (
//     req.user.role !== "admin" &&
//     deal.lead.assignedTo.toString() !== req.user.id
//   ) {
//     throw new ApiError(403, "You cannot update this deal");
//   }

//   deal.stage = stage;

//   if (stage === "Won" && !deal.closeDate) {
//     deal.closeDate = new Date();
//   }

//   await deal.save();

//   const updatedDeal = await Deal.findById(deal._id).populate(
//     "lead",
//     "name company status",
//   );

//   return res
//     .status(200)
//     .json(new ApiResponse(200, updatedDeal, "Deal stage updated successfully"));
// });

// export const updateDeal = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { amount, closeDate } = req.body;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, "Invalid Deal ID");
//   }

//   const deal = await Deal.findById(id).populate("lead");

//   if (!deal) {
//     throw new ApiError(404, "Deal not found");
//   }

//   if (
//     req.user.role !== "admin" &&
//     deal.lead.assignedTo.toString() !== req.user.id
//   ) {
//     throw new ApiError(403, "You cannot update this deal");
//   }

//   if (amount !== undefined && amount <= 0) {
//     throw new ApiError(400, "Amount must be greater than 0");
//   }

//   deal.amount = amount || deal.amount;
//   deal.closeDate = closeDate || deal.closeDate;

//   await deal.save();

//   const updatedDeal = await Deal.findById(deal._id).populate(
//     "lead",
//     "name company status",
//   );

//   return res
//     .status(200)
//     .json(new ApiResponse(200, updatedDeal, "Deal updated successfully"));
// });

// // Admin only
// export const deleteDeal = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (req.user.role !== "admin") {
//     throw new ApiError(403, "Only admin can delete deals");
//   }

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, "Invalid Deal ID");
//   }

//   const deal = await Deal.findById(id);

//   if (!deal) {
//     throw new ApiError(404, "Deal not found");
//   }

//   await deal.deleteOne();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, null, "Deal deleted successfully"));
// });
