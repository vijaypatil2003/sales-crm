import Lead from "../models/lead.model.js";
import Deal from "../models/deal.model.js";
import Activity from "../models/activity.model.js";
import { ApiResponse, asyncHandler } from "../utils/apiHelper.js";

export const getDashboard = asyncHandler(async (req, res) => {
  let leadFilter = {};
  let dealFilter = {};
  let activityFilter = {};

  if (req.user.role !== "admin") {
    leadFilter.assignedTo = req.user.id;

    const userLeads = await Lead.find(leadFilter).select("_id");
    const leadIds = userLeads.map((l) => l._id);

    if (leadIds.length === 0) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            totalLeads: 0,
            totalDeals: 0,
            dealsByStage: [],
            totalRevenue: 0,
            totalActivities: 0,
          },
          "Dashboard data fetched successfully",
        ),
      );
    }

    dealFilter.lead = { $in: leadIds };
    activityFilter.lead = { $in: leadIds };
  }

  const [totalLeads, totalDeals, dealsByStage, revenueData, totalActivities] =
    await Promise.all([
      Lead.countDocuments(leadFilter),
      Deal.countDocuments(dealFilter),
      Deal.aggregate([
        { $match: dealFilter },
        {
          $group: {
            _id: "$stage",
            count: { $sum: 1 },
          },
        },
      ]),
      Deal.aggregate([
        { $match: { ...dealFilter, stage: "Won" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
          },
        },
      ]),
      Activity.countDocuments(activityFilter),
    ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalLeads,
        totalDeals,
        dealsByStage,
        totalRevenue,
        totalActivities,
      },
      "Dashboard data fetched successfully",
    ),
  );
});
