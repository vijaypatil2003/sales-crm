import mongoose from "mongoose";
import Lead from "../models/lead.model.js";
import User from "../models/auth.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/apiHelper.js";

export const createLead = asyncHandler(async (req, res) => {
  const { name, email, phone, company, assignedTo } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  if (name.trim().length < 2) {
    throw new ApiError(400, "Name must be at least 2 characters");
  }

  if (!email && !phone) {
    throw new ApiError(400, "Either email or phone is required");
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  if (phone && !/^\+?[\d\s\-]{7,15}$/.test(phone)) {
    throw new ApiError(400, "Invalid phone format");
  }

  if (email) {
    const existing = await Lead.findOne({ email });
    if (existing) {
      throw new ApiError(409, "Lead with this email already exists");
    }
  }

  let assignedUserId;

  if (req.user.role === "admin") {
    if (!assignedTo) {
      throw new ApiError(400, "assignedTo is required");
    }
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      throw new ApiError(400, "Invalid assignedTo user ID");
    }
    const salesUser = await User.findById(assignedTo);
    if (!salesUser) {
      throw new ApiError(404, "Assigned user not found");
    }
    if (salesUser.role === "admin") {
      throw new ApiError(400, "Cannot assign lead to an admin");
    }
    assignedUserId = assignedTo;
  } else {
    assignedUserId = req.user.id;
  }

  const lead = await Lead.create({
    name: name.trim(),
    email,
    phone,
    company: company ? company.trim() : undefined,
    status: "New",
    assignedTo: assignedUserId,
  });

  const populatedLead = await Lead.findById(lead._id).populate(
    "assignedTo",
    "name email role"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedLead, "Lead created successfully"));
});

export const getLeads = asyncHandler(async (req, res) => {
  const { search, status } = req.query;

  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const skip = (page - 1) * limit;

  const allowedStatus = ["New", "Contacted", "Qualified", "Lost"];

  let filter = {};

  if (status) {
    if (!allowedStatus.includes(status)) {
      throw new ApiError(400, "Invalid status value");
    }
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }

  if (req.user.role !== "admin") {
    filter.assignedTo = req.user.id;
  }

  const totalItems = await Lead.countDocuments(filter);

  const leads = await Lead.find(filter)
    .populate("assignedTo", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalItems / limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { leads, page, limit, totalPages, totalItems },
        "Leads fetched successfully"
      )
    );
});

export const getLeadById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Lead ID");
  }

  const lead = await Lead.findById(id).populate(
    "assignedTo",
    "name email role"
  );

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  if (
    req.user.role !== "admin" &&
    lead.assignedTo._id.toString() !== req.user.id
  ) {
    throw new ApiError(403, "Access denied");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, lead, "Lead details fetched successfully"));
});

export const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, company, status } = req.body;

  const allowedStatus = ["New", "Contacted", "Qualified", "Lost"];

  if (!name && !email && !phone && !company && !status) {
    throw new ApiError(400, "At least one field is required to update");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Lead ID");
  }

  const lead = await Lead.findById(id);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  if (req.user.role !== "admin" && lead.assignedTo.toString() !== req.user.id) {
    throw new ApiError(403, "Access denied");
  }

  if (name && name.trim().length < 2) {
    throw new ApiError(400, "Name must be at least 2 characters");
  }

  if (status && !allowedStatus.includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  if (phone && !/^\+?[\d\s\-]{7,15}$/.test(phone)) {
    throw new ApiError(400, "Invalid phone format");
  }

  if (email && email !== lead.email) {
    const existing = await Lead.findOne({ email });
    if (existing) {
      throw new ApiError(409, "Lead with this email already exists");
    }
  }

  lead.name = name ? name.trim() : lead.name;
  lead.email = email || lead.email;
  lead.phone = phone || lead.phone;
  lead.company = company ? company.trim() : lead.company;
  lead.status = status || lead.status;

  await lead.save();

  const updatedLead = await Lead.findById(lead._id).populate(
    "assignedTo",
    "name email role"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedLead, "Lead updated successfully"));
});

// Admin only — reassign lead to another sales person
export const reassignLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { assignedTo } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Lead ID");
  }

  if (!assignedTo || !mongoose.Types.ObjectId.isValid(assignedTo)) {
    throw new ApiError(400, "Invalid assignedTo user ID");
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  const salesUser = await User.findById(assignedTo);
  if (!salesUser) {
    throw new ApiError(404, "User not found");
  }

  if (salesUser.role === "admin") {
    throw new ApiError(400, "Cannot assign lead to an admin");
  }

  lead.assignedTo = assignedTo;
  await lead.save();

  const updatedLead = await Lead.findById(lead._id).populate(
    "assignedTo",
    "name email role"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedLead, "Lead reassigned successfully"));
});

// Admin only
export const deleteLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Lead ID");
  }

  const lead = await Lead.findById(id);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  await lead.deleteOne();

  return res
    .status(204)
    .json(new ApiResponse(204, null, "Lead deleted successfully"));
});


// import mongoose from "mongoose";
// import Lead from "../models/lead.model.js";
// import User from "../models/auth.model.js";
// import { ApiError, ApiResponse, asyncHandler } from "../utils/apiHelper.js";



// export const createLead = asyncHandler(async (req, res) => {
//   const { name, email, phone, company, assignedTo } = req.body;

//   if (!name) {
//     throw new ApiError(400, "Name is required");
//   }

//   if (!email && !phone) {
//     throw new ApiError(400, "Either email or phone is required");
//   }

//   if (email && !/^\S+@\S+\.\S+$/.test(email)) {
//     throw new ApiError(400, "Invalid email format");
//   }

//   if (email) {
//     const existing = await Lead.findOne({ email });
//     if (existing) {
//       throw new ApiError(409, "Lead with this email already exists");
//     }
//   }

//   let assignedUserId;

//   if (req.user.role === "admin") {
//     if (!assignedTo) {
//       throw new ApiError(400, "assignedTo is required");
//     }
//     if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
//       throw new ApiError(400, "Invalid assignedTo user ID");
//     }
//     const salesUser = await User.findById(assignedTo);
//     if (!salesUser) {
//       throw new ApiError(404, "Assigned user not found");
//     }
//     if (salesUser.role === "admin") {
//       throw new ApiError(400, "Cannot assign lead to an admin");
//     }
//     assignedUserId = assignedTo;
//   } else {
//     assignedUserId = req.user.id;
//   }

//   const lead = await Lead.create({
//     name,
//     email,
//     phone,
//     company,
//     status: "New",
//     assignedTo: assignedUserId,
//   });

//   const populatedLead = await Lead.findById(lead._id).populate(
//     "assignedTo",
//     "name email role",
//   );

//   return res
//     .status(201)
//     .json(new ApiResponse(201, populatedLead, "Lead created successfully"));
// });

// export const getLeads = asyncHandler(async (req, res) => {
//   const { search, status } = req.query;

//   let page = parseInt(req.query.page) || 1;
//   let limit = parseInt(req.query.limit) || 10;

//   if (page < 1) page = 1;
//   if (limit < 1) limit = 10;

//   const skip = (page - 1) * limit;

//   const allowedStatus = ["New", "Contacted", "Qualified", "Lost"];

//   let filter = {};

//   if (status) {
//     if (!allowedStatus.includes(status)) {
//       throw new ApiError(400, "Invalid status value");
//     }
//     filter.status = status;
//   }

//   if (search) {
//     filter.$or = [
//       { name: { $regex: search, $options: "i" } },
//       { company: { $regex: search, $options: "i" } },
//     ];
//   }

//   if (req.user.role !== "admin") {
//     filter.assignedTo = req.user.id;
//   }

//   const totalItems = await Lead.countDocuments(filter);

//   const leads = await Lead.find(filter)
//     .populate("assignedTo", "name email role")
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit);

//   const totalPages = Math.ceil(totalItems / limit);

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         { leads, page, limit, totalPages, totalItems },
//         "Leads fetched successfully",
//       ),
//     );
// });

// export const getLeadById = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, "Invalid Lead ID");
//   }

//   const lead = await Lead.findById(id).populate(
//     "assignedTo",
//     "name email role",
//   );

//   if (!lead) {
//     throw new ApiError(404, "Lead not found");
//   }

//   if (
//     req.user.role !== "admin" &&
//     lead.assignedTo._id.toString() !== req.user.id
//   ) {
//     throw new ApiError(403, "Access denied");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, lead, "Lead details fetched successfully"));
// });

// export const updateLead = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { name, email, phone, company, status } = req.body;

//   const allowedStatus = ["New", "Contacted", "Qualified", "Lost"];

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, "Invalid Lead ID");
//   }

//   const lead = await Lead.findById(id);

//   if (!lead) {
//     throw new ApiError(404, "Lead not found");
//   }

//   if (req.user.role !== "admin" && lead.assignedTo.toString() !== req.user.id) {
//     throw new ApiError(403, "Access denied");
//   }

//   if (status && !allowedStatus.includes(status)) {
//     throw new ApiError(400, "Invalid status value");
//   }

//   if (email && !/^\S+@\S+\.\S+$/.test(email)) {
//     throw new ApiError(400, "Invalid email format");
//   }

//   if (email && email !== lead.email.toString()) {
//     const existing = await Lead.findOne({ email });
//     if (existing) {
//       throw new ApiError(409, "Lead with this email already exists");
//     }
//   }

//   lead.name = name || lead.name;
//   lead.email = email || lead.email;
//   lead.phone = phone || lead.phone;
//   lead.company = company || lead.company;
//   lead.status = status || lead.status;

//   await lead.save();

//   const updatedLead = await Lead.findById(lead._id).populate(
//     "assignedTo",
//     "name email role",
//   );

//   return res
//     .status(200)
//     .json(new ApiResponse(200, updatedLead, "Lead updated successfully"));
// });

// // Admin only — reassign lead to another sales person
// export const reassignLead = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { assignedTo } = req.body;

//   if (req.user.role !== "admin") {
//     throw new ApiError(403, "Only admin can reassign leads");
//   }

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, "Invalid Lead ID");
//   }

//   if (!assignedTo || !mongoose.Types.ObjectId.isValid(assignedTo)) {
//     throw new ApiError(400, "Invalid assignedTo user ID");
//   }

//   const lead = await Lead.findById(id);
//   if (!lead) {
//     throw new ApiError(404, "Lead not found");
//   }

//   const salesUser = await User.findById(assignedTo);
//   if (!salesUser) {
//     throw new ApiError(404, "User not found");
//   }

//   if (salesUser.role === "admin") {
//     throw new ApiError(400, "Cannot assign lead to an admin");
//   }

//   lead.assignedTo = assignedTo;
//   await lead.save();

//   const updatedLead = await Lead.findById(lead._id).populate(
//     "assignedTo",
//     "name email role",
//   );

//   return res
//     .status(200)
//     .json(new ApiResponse(200, updatedLead, "Lead reassigned successfully"));
// });

// // Admin only
// export const deleteLead = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (req.user.role !== "admin") {
//     throw new ApiError(403, "Only admin can delete leads");
//   }

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, "Invalid Lead ID");
//   }

//   const lead = await Lead.findById(id);

//   if (!lead) {
//     throw new ApiError(404, "Lead not found");
//   }

//   await lead.deleteOne();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, null, "Lead deleted successfully"));
// });

