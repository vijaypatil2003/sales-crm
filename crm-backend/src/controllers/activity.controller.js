
import mongoose from "mongoose";
import Activity from "../models/activity.model.js";
import Lead from "../models/lead.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/apiHelper.js";

const isValidDate = (date) => !isNaN(new Date(date).getTime());

export const createActivity = asyncHandler(async (req, res) => {
  const { leadId, type, description, activityDate } = req.body;

  const allowedTypes = ["Call", "Meeting", "Note", "Follow-up"];

  if (!leadId) {
    throw new ApiError(400, "leadId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError(400, "Invalid Lead ID");
  }

  if (!type) {
    throw new ApiError(400, "Type is required");
  }

  if (!allowedTypes.includes(type)) {
    throw new ApiError(400, "Invalid activity type");
  }

  if (!description) {
    throw new ApiError(400, "Description is required");
  }

  if (description.trim().length < 3) {
    throw new ApiError(400, "Description must be at least 3 characters");
  }

  if (description.trim().length > 1000) {
    throw new ApiError(400, "Description must not exceed 1000 characters");
  }

  if (activityDate && !isValidDate(activityDate)) {
    throw new ApiError(400, "Invalid activityDate format");
  }

  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  if (req.user.role !== "admin" && lead.assignedTo.toString() !== req.user.id) {
    throw new ApiError(403, "You cannot add activity to this lead");
  }

  const activity = await Activity.create({
    lead: leadId,
    type,
    description: description.trim(),
    activityDate: activityDate || Date.now(),
    createdBy: req.user.id,
  });

  const populatedActivity = await Activity.findById(activity._id)
    .populate("lead", "name company status")
    .populate("createdBy", "name email role");

  return res
    .status(201)
    .json(
      new ApiResponse(201, populatedActivity, "Activity created successfully")
    );
});

export const getActivities = asyncHandler(async (req, res) => {
  const { leadId, type } = req.query;

  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const skip = (page - 1) * limit;

  const allowedTypes = ["Call", "Meeting", "Note", "Follow-up"];

  let filter = {};

  if (type) {
    if (!allowedTypes.includes(type)) {
      throw new ApiError(400, "Invalid activity type");
    }
    filter.type = type;
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
        throw new ApiError(403, "You cannot access this lead's activities");
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

  const totalItems = await Activity.countDocuments(filter);

  const activities = await Activity.find(filter)
    .populate("lead", "name company status")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalItems / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        activities,
        page,
        limit,
        totalPages,
        totalItems,
      },
      "Activities fetched successfully"
    )
  );
});

export const getActivityById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Activity ID");
  }

  const activity = await Activity.findById(id)
    .populate("lead", "name company status assignedTo")
    .populate("createdBy", "name email role");

  if (!activity) {
    throw new ApiError(404, "Activity not found");
  }

  if (
    req.user.role !== "admin" &&
    activity.lead.assignedTo.toString() !== req.user.id
  ) {
    throw new ApiError(403, "Access denied");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, activity, "Activity fetched successfully"));
});

export const updateActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, description, activityDate } = req.body;

  const allowedTypes = ["Call", "Meeting", "Note", "Follow-up"];

  if (!type && !description && !activityDate) {
    throw new ApiError(400, "At least one field is required to update");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Activity ID");
  }

  const activity = await Activity.findById(id).populate("lead");

  if (!activity) {
    throw new ApiError(404, "Activity not found");
  }

  if (
    req.user.role !== "admin" &&
    activity.lead.assignedTo.toString() !== req.user.id
  ) {
    throw new ApiError(403, "You cannot update this activity");
  }

  if (type && !allowedTypes.includes(type)) {
    throw new ApiError(400, "Invalid activity type");
  }

  if (description !== undefined) {
    if (!description.trim()) {
      throw new ApiError(400, "Description cannot be empty");
    }
    if (description.trim().length < 3) {
      throw new ApiError(400, "Description must be at least 3 characters");
    }
    if (description.trim().length > 1000) {
      throw new ApiError(400, "Description must not exceed 1000 characters");
    }
  }

  if (activityDate && !isValidDate(activityDate)) {
    throw new ApiError(400, "Invalid activityDate format");
  }

  activity.type = type || activity.type;
  activity.description = description ? description.trim() : activity.description;
  activity.activityDate = activityDate || activity.activityDate;

  await activity.save();

  const updatedActivity = await Activity.findById(activity._id)
    .populate("lead", "name company status")
    .populate("createdBy", "name email role");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedActivity, "Activity updated successfully")
    );
});

// Admin only
export const deleteActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Activity ID");
  }

  const activity = await Activity.findById(id);

  if (!activity) {
    throw new ApiError(404, "Activity not found");
  }

  await activity.deleteOne();

  return res
    .status(204)
    .json(new ApiResponse(204, null, "Activity deleted successfully"));
});


// import mongoose from "mongoose";
// import Activity from "../models/activity.model.js";
// import Lead from "../models/lead.model.js";
// import { ApiError, ApiResponse, asyncHandler } from "../utils/apiHelper.js";

// export const createActivity = asyncHandler(async (req, res) => {
//   const { leadId, type, description, activityDate } = req.body;

//   const allowedTypes = ["Call", "Meeting", "Note", "Follow-up"];

//   if (!leadId) {
//     throw new ApiError(400, "leadId is required");
//   }

//   if (!mongoose.Types.ObjectId.isValid(leadId)) {
//     throw new ApiError(400, "Invalid Lead ID");
//   }

//   if (!type) {
//     throw new ApiError(400, "Type is required");
//   }

//   if (!allowedTypes.includes(type)) {
//     throw new ApiError(400, "Invalid activity type");
//   }

//   if (!description) {
//     throw new ApiError(400, "Description is required");
//   }

//   const lead = await Lead.findById(leadId);

//   if (!lead) {
//     throw new ApiError(404, "Lead not found");
//   }

//   if (req.user.role !== "admin" && lead.assignedTo.toString() !== req.user.id) {
//     throw new ApiError(403, "You cannot add activity to this lead");
//   }

//   const activity = await Activity.create({
//     lead: leadId,
//     type,
//     description,
//     activityDate: activityDate || Date.now(),
//     createdBy: req.user.id,
//   });

//   const populatedActivity = await Activity.findById(activity._id)
//     .populate("lead", "name company status")
//     .populate("createdBy", "name email role");

//   return res
//     .status(201)
//     .json(
//       new ApiResponse(201, populatedActivity, "Activity created successfully"),
//     );
// });

// export const getActivities = asyncHandler(async (req, res) => {
//   const { leadId, type } = req.query;

//   let page = parseInt(req.query.page) || 1;
//   let limit = parseInt(req.query.limit) || 10;

//   if (page < 1) page = 1;
//   if (limit < 1) limit = 10;
//   if (limit > 100) limit = 100;

//   const skip = (page - 1) * limit;

//   const allowedTypes = ["Call", "Meeting", "Note", "Follow-up"];

//   let filter = {};

//   if (type) {
//     if (!allowedTypes.includes(type)) {
//       throw new ApiError(400, "Invalid activity type");
//     }
//     filter.type = type;
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
//         throw new ApiError(403, "You cannot access this lead's activities");
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

//   const totalItems = await Activity.countDocuments(filter);

//   const activities = await Activity.find(filter)
//     .populate("lead", "name company status")
//     .populate("createdBy", "name email role")
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit);

//   const totalPages = Math.ceil(totalItems / limit);

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         activities,
//         page,
//         limit,
//         totalPages,
//         totalItems,
//       },
//       "Activities fetched successfully",
//     ),
//   );
// });

// export const getActivityById = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, "Invalid Activity ID");
//   }

//   const activity = await Activity.findById(id)
//     .populate("lead", "name company status assignedTo")
//     .populate("createdBy", "name email role");

//   if (!activity) {
//     throw new ApiError(404, "Activity not found");
//   }

//   if (
//     req.user.role !== "admin" &&
//     activity.lead.assignedTo.toString() !== req.user.id
//   ) {
//     throw new ApiError(403, "Access denied");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, activity, "Activity fetched successfully"));
// });

// export const updateActivity = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { type, description, activityDate } = req.body;

//   const allowedTypes = ["Call", "Meeting", "Note", "Follow-up"];

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, "Invalid Activity ID");
//   }

//   const activity = await Activity.findById(id).populate("lead");

//   if (!activity) {
//     throw new ApiError(404, "Activity not found");
//   }

//   if (
//     req.user.role !== "admin" &&
//     activity.lead.assignedTo.toString() !== req.user.id
//   ) {
//     throw new ApiError(403, "You cannot update this activity");
//   }

//   if (type && !allowedTypes.includes(type)) {
//     throw new ApiError(400, "Invalid activity type");
//   }

//   activity.type = type || activity.type;
//   activity.description = description || activity.description;
//   activity.activityDate = activityDate || activity.activityDate;

//   await activity.save();

//   const updatedActivity = await Activity.findById(activity._id)
//     .populate("lead", "name company status")
//     .populate("createdBy", "name email role");

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, updatedActivity, "Activity updated successfully"),
//     );
// });

// // Admin only
// export const deleteActivity = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (req.user.role !== "admin") {
//     throw new ApiError(403, "Only admin can delete activities");
//   }

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, "Invalid Activity ID");
//   }

//   const activity = await Activity.findById(id);

//   if (!activity) {
//     throw new ApiError(404, "Activity not found");
//   }

//   await activity.deleteOne();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, null, "Activity deleted successfully"));
// });
