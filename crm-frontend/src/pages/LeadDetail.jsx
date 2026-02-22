import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const statusColors = {
  New: "bg-blue-100 text-blue-700 border-blue-200",
  Contacted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Qualified: "bg-green-100 text-green-700 border-green-200",
  Lost: "bg-red-100 text-red-700 border-red-200",
};

const activityIcons = {
  Call: "📞",
  Meeting: "🤝",
  Note: "📝",
  "Follow-up": "🔔",
};

const stageColors = {
  Prospect: "bg-yellow-500",
  Negotiation: "bg-blue-500",
  Won: "bg-green-500",
  Lost: "bg-red-500",
};

function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [lead, setLead] = useState(null);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "",
  });

  const [salesUsers, setSalesUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [reassigning, setReassigning] = useState(false);

  const [activityType, setActivityType] = useState("Call");
  const [activityDescription, setActivityDescription] = useState("");
  const [activitySubmitting, setActivitySubmitting] = useState(false);

  const [dealAmount, setDealAmount] = useState("");
  const [dealCloseDate, setDealCloseDate] = useState("");
  const [dealSubmitting, setDealSubmitting] = useState(false);

  const [editingDeal, setEditingDeal] = useState(null);
  const [editDealAmount, setEditDealAmount] = useState("");
  const [editDealCloseDate, setEditDealCloseDate] = useState("");
  const [dealUpdating, setDealUpdating] = useState(false);

  const [activeTab, setActiveTab] = useState("activities");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadRes, dealsRes, activityRes] = await Promise.all([
          api.get(`/leads/${id}`),
          api.get(`/deals?leadId=${id}`),
          api.get(`/activity?leadId=${id}`),
        ]);
        setLead(leadRes.data.data);
        setFormData(leadRes.data.data);
        setDeals(dealsRes.data.data.deals);
        setActivities(activityRes.data.data.activities);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        try {
          const res = await api.get("/auth/users");
          setSalesUsers(
            res.data.data.filter((u) => u.role?.toLowerCase() !== "admin"),
          );
        } catch {}
      };
      fetchUsers();
    }
  }, [isAdmin]);

  const handleSave = async () => {
    try {
      const res = await api.patch(`/leads/${id}`, formData);
      setLead(res.data.data);
      setIsEditing(false);
    } catch {
      alert("Failed to update lead");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await api.delete(`/leads/${id}`);
      navigate("/leads");
    } catch {
      alert("Failed to delete lead");
    }
  };

  const handleReassign = async () => {
    if (!selectedUser) return;
    try {
      setReassigning(true);
      const res = await api.patch(`/leads/${id}/reassign`, {
        assignedTo: selectedUser,
      });
      setLead(res.data.data);
      alert("Lead reassigned successfully");
    } catch {
      alert("Failed to reassign");
    } finally {
      setReassigning(false);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!activityDescription.trim()) {
      alert("Description is required");
      return;
    }
    try {
      setActivitySubmitting(true);
      const res = await api.post("/activity", {
        leadId: id,
        type: activityType,
        description: activityDescription,
      });
      setActivities((prev) => [res.data.data, ...prev]);
      setActivityDescription("");
    } catch {
      alert("Failed to add activity");
    } finally {
      setActivitySubmitting(false);
    }
  };

  const handleAddDeal = async (e) => {
    e.preventDefault();
    if (!dealAmount || dealAmount <= 0) {
      alert("Valid amount is required");
      return;
    }
    try {
      setDealSubmitting(true);
      const res = await api.post("/deals", {
        leadId: id,
        amount: Number(dealAmount),
        closeDate: dealCloseDate || null,
      });
      setDeals((prev) => [res.data.data, ...prev]);
      setDealAmount("");
      setDealCloseDate("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add deal");
    } finally {
      setDealSubmitting(false);
    }
  };

  const handleStageChange = async (dealId, newStage) => {
    try {
      await api.patch(`/deals/${dealId}/stage`, { stage: newStage });
      setDeals((prev) =>
        prev.map((d) => (d._id === dealId ? { ...d, stage: newStage } : d)),
      );
    } catch {
      alert("Failed to update stage");
    }
  };

  const handleUpdateDeal = async (dealId) => {
    if (!editDealAmount || editDealAmount <= 0) {
      alert("Valid amount is required");
      return;
    }
    try {
      setDealUpdating(true);
      const res = await api.patch(`/deals/${dealId}`, {
        amount: Number(editDealAmount),
        closeDate: editDealCloseDate || null,
      });
      setDeals((prev) =>
        prev.map((d) => (d._id === dealId ? res.data.data : d)),
      );
      setEditingDeal(null);
    } catch {
      alert("Failed to update deal");
    } finally {
      setDealUpdating(false);
    }
  };

  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm("Delete this deal?")) return;
    try {
      await api.delete(`/deals/${dealId}`);
      setDeals((prev) => prev.filter((d) => d._id !== dealId));
    } catch {
      alert("Failed to delete deal");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  if (error)
    return <p className="p-6 text-red-500">Failed to load lead details</p>;
  if (!lead) return <p className="p-6">Lead not found</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/leads")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          ← Back to Leads
        </button>
        <div className="flex gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              ✏️ Edit Lead
            </button>
          )}
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>

      {/* Lead Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
              <p className="text-blue-200 text-sm mt-1">
                {lead.company || "No company"}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[lead.status] || "bg-gray-100 text-gray-600"}`}
            >
              {lead.status}
            </span>
          </div>
        </div>

        {/* Info Body */}
        <div className="p-6">
          {!isEditing ? (
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-lg">
                  📧
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-gray-800 font-medium">
                    {lead.email || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-lg">
                  📞
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Phone
                  </p>
                  <p className="text-gray-800 font-medium">
                    {lead.phone || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-lg">
                  🏢
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Company
                  </p>
                  <p className="text-gray-800 font-medium">
                    {lead.company || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-lg">
                  👤
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Assigned To
                  </p>
                  <p className="text-gray-800 font-medium">
                    {lead.assignedTo?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Name *
                </label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 border border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Email
                </label>
                <input
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 border border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Phone
                </label>
                <input
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="mt-1 border border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Company
                </label>
                <input
                  value={formData.company || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className="mt-1 border border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="mt-1 border border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div className="col-span-2 flex gap-3 mt-2">
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reassign Card (Admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🔄 Reassign Lead
          </h2>
          <div className="flex gap-3">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="flex-1 border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Sales Person</option>
              {salesUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} — {u.email}
                </option>
              ))}
            </select>
            <button
              onClick={handleReassign}
              disabled={reassigning || !selectedUser}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {reassigning ? "Reassigning..." : "Reassign"}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("activities")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === "activities" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700"}`}
          >
            📋 Activities ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab("deals")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === "deals" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700"}`}
          >
            💼 Deals ({deals.length})
          </button>
        </div>

        {/* Activities Tab */}
        {activeTab === "activities" && (
          <div className="p-6">
            {/* Add Activity Form */}
            <form
              onSubmit={handleAddActivity}
              className="flex gap-3 mb-6 flex-wrap"
            >
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Call">📞 Call</option>
                <option value="Meeting">🤝 Meeting</option>
                <option value="Note">📝 Note</option>
                <option value="Follow-up">🔔 Follow-up</option>
              </select>
              <input
                type="text"
                placeholder="Add a description..."
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
                className="flex-1 border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48"
              />
              <button
                type="submit"
                disabled={activitySubmitting}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {activitySubmitting ? "Adding..." : "+ Add"}
              </button>
            </form>

            {/* Activity List */}
            {activities.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p>No activities yet. Log your first activity above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl flex-shrink-0">
                      {activityIcons[activity.type] || "📌"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                          {activity.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(activity.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        by {activity.createdBy?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Deals Tab */}
        {activeTab === "deals" && (
          <div className="p-6">
            {/* Add Deal Form */}
            <form
              onSubmit={handleAddDeal}
              className="flex gap-3 mb-6 flex-wrap items-end"
            >
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={dealAmount}
                  onChange={(e) => setDealAmount(e.target.value)}
                  min={1}
                  className="border border-gray-200 p-2.5 rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">
                  Close Date
                </label>
                <input
                  type="date"
                  value={dealCloseDate}
                  onChange={(e) => setDealCloseDate(e.target.value)}
                  className="border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={dealSubmitting}
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {dealSubmitting ? "Adding..." : "+ Add Deal"}
              </button>
            </form>

            {/* Deals List */}
            {deals.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">💼</p>
                <p>No deals yet. Create a deal from this lead!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deals.map((deal) => (
                  <div
                    key={deal._id}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50"
                  >
                    {editingDeal === deal._id ? (
                      <div className="flex gap-3 flex-wrap items-center">
                        <input
                          type="number"
                          value={editDealAmount}
                          onChange={(e) => setEditDealAmount(e.target.value)}
                          className="border border-gray-200 p-2 rounded-lg w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min={1}
                        />
                        <input
                          type="date"
                          value={editDealCloseDate}
                          onChange={(e) => setEditDealCloseDate(e.target.value)}
                          className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleUpdateDeal(deal._id)}
                          disabled={dealUpdating}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingDeal(null)}
                          className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                              Amount
                            </p>
                            <p className="text-lg font-bold text-gray-800">
                              ₹ {deal.amount.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                              Close Date
                            </p>
                            <p className="text-sm text-gray-700">
                              {deal.closeDate
                                ? new Date(deal.closeDate).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : "Not set"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={deal.stage}
                            onChange={(e) =>
                              handleStageChange(deal._id, e.target.value)
                            }
                            className={`text-white text-sm font-semibold px-3 py-1.5 rounded-lg border-0 ${stageColors[deal.stage]}`}
                          >
                            <option value="Prospect">Prospect</option>
                            <option value="Negotiation">Negotiation</option>
                            <option value="Won">Won</option>
                            <option value="Lost">Lost</option>
                          </select>
                          <button
                            onClick={() => {
                              setEditingDeal(deal._id);
                              setEditDealAmount(deal.amount);
                              setEditDealCloseDate(
                                deal.closeDate
                                  ? new Date(deal.closeDate)
                                      .toISOString()
                                      .split("T")[0]
                                  : "",
                              );
                            }}
                            className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteDeal(deal._id)}
                              className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-200"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LeadDetail;

// =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/axios";
// import { useAuth } from "../context/AuthContext";

// function LeadDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [lead, setLead] = useState(null);
//   const [deals, setDeals] = useState([]);
//   const [activities, setActivities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     company: "",
//     status: "",
//   });

//   const [salesUsers, setSalesUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState("");
//   const [reassigning, setReassigning] = useState(false);

//   const [activityType, setActivityType] = useState("Call");
//   const [activityDescription, setActivityDescription] = useState("");
//   const [activitySubmitting, setActivitySubmitting] = useState(false);

//   const [dealAmount, setDealAmount] = useState("");
//   const [dealCloseDate, setDealCloseDate] = useState("");
//   const [dealSubmitting, setDealSubmitting] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [leadRes, dealsRes, activityRes] = await Promise.all([
//           api.get(`/leads/${id}`),
//           api.get(`/deals?leadId=${id}`),
//           api.get(`/activity?leadId=${id}`),
//         ]);

//         setLead(leadRes.data.data);
//         setFormData(leadRes.data.data);
//         setDeals(dealsRes.data.data);
//         setActivities(activityRes.data.data.activities);
//       } catch {
//         setError(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [id]);

//   useEffect(() => {
//     if (user?.role === "admin") {
//       const fetchUsers = async () => {
//         try {
//           const res = await api.get("/auth/users");
//           setSalesUsers(res.data.data.filter((u) => u.role !== "admin"));
//         } catch {}
//       };
//       fetchUsers();
//     }
//   }, [user]);

//   const handleSave = async () => {
//     try {
//       const res = await api.patch(`/leads/${id}`, formData);
//       setLead(res.data.data);
//       setIsEditing(false);
//     } catch {
//       alert("Failed to update lead");
//     }
//   };

//   const handleDelete = async () => {
//     if (!window.confirm("Are you sure you want to delete this lead?")) return;
//     try {
//       await api.delete(`/leads/${id}`);
//       navigate("/leads");
//     } catch {
//       alert("Failed to delete lead");
//     }
//   };

//   const handleReassign = async () => {
//     if (!selectedUser) return;
//     try {
//       setReassigning(true);
//       await api.patch(`/leads/${id}/reassign`, { assignedTo: selectedUser });
//       alert("Lead reassigned successfully");
//     } catch {
//       alert("Failed to reassign");
//     } finally {
//       setReassigning(false);
//     }
//   };

//   const handleAddActivity = async (e) => {
//     e.preventDefault();
//     if (!activityDescription.trim()) {
//       alert("Description is required");
//       return;
//     }
//     try {
//       setActivitySubmitting(true);
//       const res = await api.post("/activity", {
//         leadId: id,
//         type: activityType,
//         description: activityDescription,
//       });
//       setActivities((prev) => [res.data.data, ...prev]);
//       setActivityDescription("");
//     } catch {
//       alert("Failed to add activity");
//     } finally {
//       setActivitySubmitting(false);
//     }
//   };

//   const handleAddDeal = async (e) => {
//     e.preventDefault();
//     if (!dealAmount || dealAmount <= 0) {
//       alert("Valid amount is required");
//       return;
//     }
//     try {
//       setDealSubmitting(true);
//       const res = await api.post("/deals", {
//         leadId: id,
//         amount: Number(dealAmount),
//         closeDate: dealCloseDate || null,
//       });
//       setDeals((prev) => [res.data.data, ...prev]);
//       setDealAmount("");
//       setDealCloseDate("");
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to add deal");
//     } finally {
//       setDealSubmitting(false);
//     }
//   };

//   const handleStageChange = async (dealId, newStage) => {
//     try {
//       await api.patch(`/deals/${dealId}/stage`, { stage: newStage });
//       setDeals((prev) =>
//         prev.map((deal) =>
//           deal._id === dealId ? { ...deal, stage: newStage } : deal,
//         ),
//       );
//     } catch {
//       alert("Failed to update stage");
//     }
//   };

//   const getStageColor = (stage) => {
//     switch (stage) {
//       case "Prospect":
//         return "bg-yellow-500";
//       case "Negotiation":
//         return "bg-blue-500";
//       case "Won":
//         return "bg-green-500";
//       case "Lost":
//         return "bg-red-500";
//       default:
//         return "bg-gray-500";
//     }
//   };

//   if (loading) return <p className="p-6">Loading...</p>;
//   if (error)
//     return <p className="p-6 text-red-500">Failed to load lead details</p>;
//   if (!lead) return <p className="p-6">Lead not found</p>;

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6">Lead Details</h1>

//       <div className="bg-white shadow rounded p-6 space-y-4">
//         {!isEditing ? (
//           <>
//             <p>
//               <strong>Name:</strong> {lead.name}
//             </p>
//             <p>
//               <strong>Email:</strong> {lead.email || "N/A"}
//             </p>
//             <p>
//               <strong>Phone:</strong> {lead.phone || "N/A"}
//             </p>
//             <p>
//               <strong>Company:</strong> {lead.company || "N/A"}
//             </p>
//             <p>
//               <strong>Status:</strong> {lead.status}
//             </p>
//             <p>
//               <strong>Assigned To:</strong> {lead.assignedTo?.name || "N/A"}
//             </p>

//             <div className="flex gap-4 mt-4">
//               <button
//                 onClick={() => setIsEditing(true)}
//                 className="bg-blue-600 text-white px-4 py-2 rounded"
//               >
//                 Edit
//               </button>
//               {user?.role === "admin" && (
//                 <button
//                   onClick={handleDelete}
//                   className="bg-red-600 text-white px-4 py-2 rounded"
//                 >
//                   Delete
//                 </button>
//               )}
//             </div>
//           </>
//         ) : (
//           <>
//             <input
//               name="name"
//               value={formData.name}
//               onChange={(e) =>
//                 setFormData({ ...formData, name: e.target.value })
//               }
//               className="border p-2 rounded w-full"
//               placeholder="Name"
//             />
//             <input
//               name="email"
//               value={formData.email || ""}
//               onChange={(e) =>
//                 setFormData({ ...formData, email: e.target.value })
//               }
//               className="border p-2 rounded w-full"
//               placeholder="Email"
//             />
//             <input
//               name="phone"
//               value={formData.phone || ""}
//               onChange={(e) =>
//                 setFormData({ ...formData, phone: e.target.value })
//               }
//               className="border p-2 rounded w-full"
//               placeholder="Phone"
//             />
//             <input
//               name="company"
//               value={formData.company || ""}
//               onChange={(e) =>
//                 setFormData({ ...formData, company: e.target.value })
//               }
//               className="border p-2 rounded w-full"
//               placeholder="Company"
//             />
//             <select
//               name="status"
//               value={formData.status}
//               onChange={(e) =>
//                 setFormData({ ...formData, status: e.target.value })
//               }
//               className="border p-2 rounded w-full"
//             >
//               <option value="New">New</option>
//               <option value="Contacted">Contacted</option>
//               <option value="Qualified">Qualified</option>
//               <option value="Lost">Lost</option>
//             </select>

//             <div className="flex gap-4 mt-4">
//               <button
//                 onClick={handleSave}
//                 className="bg-green-600 text-white px-4 py-2 rounded"
//               >
//                 Save
//               </button>
//               <button
//                 onClick={() => setIsEditing(false)}
//                 className="bg-gray-500 text-white px-4 py-2 rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </>
//         )}
//       </div>

//       {user?.role === "admin" && (
//         <div className="bg-white shadow rounded p-6 mt-6">
//           <h2 className="font-bold mb-4">Reassign Lead</h2>
//           <select
//             value={selectedUser}
//             onChange={(e) => setSelectedUser(e.target.value)}
//             className="border p-2 rounded w-full"
//           >
//             <option value="">Select Sales User</option>
//             {salesUsers.map((u) => (
//               <option key={u._id} value={u._id}>
//                 {u.name} — {u.email}
//               </option>
//             ))}
//           </select>
//           <button
//             onClick={handleReassign}
//             disabled={reassigning}
//             className="bg-purple-600 text-white px-4 py-2 rounded mt-4 disabled:opacity-50"
//           >
//             {reassigning ? "Reassigning..." : "Reassign"}
//           </button>
//         </div>
//       )}

//       <div className="mt-10">
//         <h2 className="text-xl font-bold mb-4">Deals</h2>

//         <div className="bg-white shadow rounded p-4 mb-6">
//           <h3 className="font-semibold mb-4">Add Deal</h3>
//           <form
//             onSubmit={handleAddDeal}
//             className="flex gap-4 items-center flex-wrap"
//           >
//             <input
//               type="number"
//               placeholder="Amount"
//               value={dealAmount}
//               onChange={(e) => setDealAmount(e.target.value)}
//               className="border p-2 rounded w-40"
//               min={1}
//             />
//             <input
//               type="date"
//               value={dealCloseDate}
//               onChange={(e) => setDealCloseDate(e.target.value)}
//               className="border p-2 rounded"
//             />
//             <button
//               type="submit"
//               disabled={dealSubmitting}
//               className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
//             >
//               {dealSubmitting ? "Adding..." : "Add Deal"}
//             </button>
//           </form>
//         </div>

//         {deals.length === 0 ? (
//           <p className="text-gray-500 italic">No deals yet.</p>
//         ) : (
//           <div className="bg-white shadow rounded p-4">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b text-left">
//                   <th className="py-2">Amount</th>
//                   <th>Stage</th>
//                   <th>Close Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {deals.map((deal) => (
//                   <tr key={deal._id} className="border-b">
//                     <td className="py-2">
//                       ₹ {deal.amount.toLocaleString("en-IN")}
//                     </td>
//                     <td>
//                       <select
//                         value={deal.stage}
//                         onChange={(e) =>
//                           handleStageChange(deal._id, e.target.value)
//                         }
//                         className={`text-white px-2 py-1 rounded ${getStageColor(deal.stage)}`}
//                       >
//                         <option value="Prospect">Prospect</option>
//                         <option value="Negotiation">Negotiation</option>
//                         <option value="Won">Won</option>
//                         <option value="Lost">Lost</option>
//                       </select>
//                     </td>
//                     <td>
//                       {deal.closeDate
//                         ? new Date(deal.closeDate).toLocaleDateString()
//                         : "N/A"}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       <div className="mt-10">
//         <h2 className="text-xl font-bold mb-4">Activities</h2>

//         <div className="bg-white shadow rounded p-4 mb-6">
//           <h3 className="font-semibold mb-4">Add Activity</h3>
//           <form
//             onSubmit={handleAddActivity}
//             className="flex gap-4 items-center flex-wrap"
//           >
//             <select
//               value={activityType}
//               onChange={(e) => setActivityType(e.target.value)}
//               className="border p-2 rounded"
//             >
//               <option value="Call">Call</option>
//               <option value="Meeting">Meeting</option>
//               <option value="Note">Note</option>
//               <option value="Follow-up">Follow-up</option>
//             </select>
//             <input
//               type="text"
//               placeholder="Description"
//               value={activityDescription}
//               onChange={(e) => setActivityDescription(e.target.value)}
//               className="border p-2 rounded flex-1"
//             />
//             <button
//               type="submit"
//               disabled={activitySubmitting}
//               className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
//             >
//               {activitySubmitting ? "Adding..." : "Add Activity"}
//             </button>
//           </form>
//         </div>

//         {activities.length === 0 ? (
//           <p className="text-gray-500 italic">No activities yet.</p>
//         ) : (
//           <div className="bg-white shadow rounded p-4">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b text-left">
//                   <th className="py-2">Type</th>
//                   <th>Description</th>
//                   <th>Created By</th>
//                   <th>Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {activities.map((activity) => (
//                   <tr key={activity._id} className="border-b">
//                     <td className="py-2">{activity.type}</td>
//                     <td>{activity.description}</td>
//                     <td>{activity.createdBy?.name || "N/A"}</td>
//                     <td>{new Date(activity.createdAt).toLocaleDateString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default LeadDetail;
// // =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../api/axios";

// function LeadDetail() {
//   const { id } = useParams();

//   const [lead, setLead] = useState(null);
//   const [deals, setDeals] = useState([]);
//   const [activities, setActivities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   const [activityType, setActivityType] = useState("Call");
//   const [activityDescription, setActivityDescription] = useState("");
//   const [activitySubmitting, setActivitySubmitting] = useState(false);

//   const [dealAmount, setDealAmount] = useState("");
//   const [dealCloseDate, setDealCloseDate] = useState("");
//   const [dealSubmitting, setDealSubmitting] = useState(false);

//   const [leadStatus, setLeadStatus] = useState("");
//   const [statusUpdating, setStatusUpdating] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [leadRes, dealsRes, activityRes] = await Promise.all([
//           api.get(`/leads/${id}`),
//           api.get(`/deals?leadId=${id}`),
//           api.get(`/activity?leadId=${id}`),
//         ]);

//         setLead(leadRes.data.data);
//         setLeadStatus(leadRes.data.data.status);
//         setDeals(dealsRes.data.data);
//         setActivities(activityRes.data.data.activities);
//       } catch (err) {
//         setError(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [id]);

//   const handleStatusUpdate = async (newStatus) => {
//     try {
//       setStatusUpdating(true);
//       await api.patch(`/leads/${id}`, { status: newStatus });
//       setLeadStatus(newStatus);
//       setLead((prev) => ({ ...prev, status: newStatus }));
//     } catch (err) {
//       alert("Failed to update lead status");
//     } finally {
//       setStatusUpdating(false);
//     }
//   };

//   const handleAddActivity = async (e) => {
//     e.preventDefault();

//     if (!activityDescription.trim()) {
//       alert("Description is required");
//       return;
//     }

//     try {
//       setActivitySubmitting(true);

//       const res = await api.post("/activity", {
//         leadId: id,
//         type: activityType,
//         description: activityDescription,
//       });

//       setActivities((prev) => [res.data.data, ...prev]);
//       setActivityDescription("");
//     } catch (err) {
//       alert("Failed to add activity");
//     } finally {
//       setActivitySubmitting(false);
//     }
//   };

//   const handleAddDeal = async (e) => {
//     e.preventDefault();

//     if (!dealAmount || dealAmount <= 0) {
//       alert("Valid amount is required");
//       return;
//     }

//     try {
//       setDealSubmitting(true);

//       const res = await api.post("/deals", {
//         leadId: id,
//         amount: Number(dealAmount),
//         closeDate: dealCloseDate || null,
//       });

//       setDeals((prev) => [res.data.data, ...prev]);
//       setDealAmount("");
//       setDealCloseDate("");
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to add deal");
//     } finally {
//       setDealSubmitting(false);
//     }
//   };

//   const handleStageChange = async (dealId, newStage) => {
//     try {
//       await api.patch(`/deals/${dealId}/stage`, { stage: newStage });
//       setDeals((prev) =>
//         prev.map((deal) =>
//           deal._id === dealId ? { ...deal, stage: newStage } : deal,
//         ),
//       );
//     } catch (err) {
//       alert("Failed to update stage");
//     }
//   };

//   const getStageColor = (stage) => {
//     switch (stage) {
//       case "Prospect":
//         return "bg-yellow-500";
//       case "Negotiation":
//         return "bg-blue-500";
//       case "Won":
//         return "bg-green-500";
//       case "Lost":
//         return "bg-red-500";
//       default:
//         return "bg-gray-500";
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "New":
//         return "bg-blue-100 text-blue-700";
//       case "Contacted":
//         return "bg-yellow-100 text-yellow-700";
//       case "Qualified":
//         return "bg-green-100 text-green-700";
//       case "Lost":
//         return "bg-red-100 text-red-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   if (loading) return <p className="p-6">Loading...</p>;
//   if (error)
//     return <p className="p-6 text-red-500">Failed to load lead details</p>;
//   if (!lead) return <p className="p-6">Lead not found</p>;

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6">Lead Details</h1>

//       <div className="bg-white shadow rounded p-6 space-y-4">
//         <div className="flex justify-between items-start">
//           <div className="space-y-3">
//             <p>
//               <strong>Name:</strong> {lead.name}
//             </p>
//             <p>
//               <strong>Email:</strong> {lead.email || "N/A"}
//             </p>
//             <p>
//               <strong>Phone:</strong> {lead.phone || "N/A"}
//             </p>
//             <p>
//               <strong>Company:</strong> {lead.company || "N/A"}
//             </p>
//             <p>
//               <strong>Assigned To:</strong> {lead.assignedTo?.name || "N/A"}
//             </p>
//           </div>

//           <div className="flex flex-col items-end gap-2">
//             <span
//               className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(leadStatus)}`}
//             >
//               {leadStatus}
//             </span>
//             <select
//               value={leadStatus}
//               onChange={(e) => handleStatusUpdate(e.target.value)}
//               disabled={statusUpdating}
//               className="border p-2 rounded text-sm"
//             >
//               <option value="New">New</option>
//               <option value="Contacted">Contacted</option>
//               <option value="Qualified">Qualified</option>
//               <option value="Lost">Lost</option>
//             </select>
//             {statusUpdating && (
//               <p className="text-xs text-gray-400">Updating...</p>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="mt-10">
//         <h2 className="text-xl font-bold mb-4">Deals</h2>

//         <div className="bg-white shadow rounded p-4 mb-6">
//           <h3 className="font-semibold mb-4">Add Deal</h3>

//           <form
//             onSubmit={handleAddDeal}
//             className="flex gap-4 items-center flex-wrap"
//           >
//             <input
//               type="number"
//               placeholder="Amount"
//               value={dealAmount}
//               onChange={(e) => setDealAmount(e.target.value)}
//               className="border p-2 rounded w-40"
//               min={1}
//             />

//             <input
//               type="date"
//               value={dealCloseDate}
//               onChange={(e) => setDealCloseDate(e.target.value)}
//               className="border p-2 rounded"
//             />

//             <button
//               type="submit"
//               disabled={dealSubmitting}
//               className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
//             >
//               {dealSubmitting ? "Adding..." : "Add Deal"}
//             </button>
//           </form>
//         </div>

//         {deals.length === 0 ? (
//           <p className="text-gray-500 italic">No deals yet.</p>
//         ) : (
//           <div className="bg-white shadow rounded p-4">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b text-left">
//                   <th className="py-2">Amount</th>
//                   <th>Stage</th>
//                   <th>Close Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {deals.map((deal) => (
//                   <tr key={deal._id} className="border-b">
//                     <td className="py-2">
//                       ₹ {deal.amount.toLocaleString("en-IN")}
//                     </td>
//                     <td>
//                       <select
//                         value={deal.stage}
//                         onChange={(e) =>
//                           handleStageChange(deal._id, e.target.value)
//                         }
//                         className={`text-white px-2 py-1 rounded ${getStageColor(deal.stage)}`}
//                       >
//                         <option value="Prospect">Prospect</option>
//                         <option value="Negotiation">Negotiation</option>
//                         <option value="Won">Won</option>
//                         <option value="Lost">Lost</option>
//                       </select>
//                     </td>
//                     <td>
//                       {deal.closeDate
//                         ? new Date(deal.closeDate).toLocaleDateString()
//                         : "N/A"}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       <div className="mt-10">
//         <h2 className="text-xl font-bold mb-4">Activities</h2>

//         <div className="bg-white shadow rounded p-4 mb-6">
//           <h3 className="font-semibold mb-4">Add Activity</h3>

//           <form
//             onSubmit={handleAddActivity}
//             className="flex gap-4 items-center flex-wrap"
//           >
//             <select
//               value={activityType}
//               onChange={(e) => setActivityType(e.target.value)}
//               className="border p-2 rounded"
//             >
//               <option value="Call">Call</option>
//               <option value="Meeting">Meeting</option>
//               <option value="Note">Note</option>
//               <option value="Follow-up">Follow-up</option>
//             </select>

//             <input
//               type="text"
//               placeholder="Description"
//               value={activityDescription}
//               onChange={(e) => setActivityDescription(e.target.value)}
//               className="border p-2 rounded flex-1"
//             />

//             <button
//               type="submit"
//               disabled={activitySubmitting}
//               className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
//             >
//               {activitySubmitting ? "Adding..." : "Add Activity"}
//             </button>
//           </form>
//         </div>

//         {activities.length === 0 ? (
//           <p className="text-gray-500 italic">No activities yet.</p>
//         ) : (
//           <div className="bg-white shadow rounded p-4">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b text-left">
//                   <th className="py-2">Type</th>
//                   <th>Description</th>
//                   <th>Created By</th>
//                   <th>Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {activities.map((activity) => (
//                   <tr key={activity._id} className="border-b">
//                     <td className="py-2">{activity.type}</td>
//                     <td>{activity.description}</td>
//                     <td>{activity.createdBy?.name || "N/A"}</td>
//                     <td>{new Date(activity.createdAt).toLocaleDateString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default LeadDetail;

// =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================

// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/axios";
// import { useAuth } from "../context/AuthContext";

// function LeadDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [lead, setLead] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     company: "",
//     status: "",
//   });

//   const [salesUsers, setSalesUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState("");

//   // ---------------- Fetch Lead ----------------
//   useEffect(() => {
//     const fetchLead = async () => {
//       try {
//         const res = await api.get(`/leads/${id}`);
//         setLead(res.data.data);
//         setFormData(res.data.data);
//       } catch {
//         alert("Failed to fetch lead");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLead();
//   }, [id]);

//   // ---------------- Fetch Sales Users (Admin Only) ----------------
//   useEffect(() => {
//     if (user?.role === "admin") {
//       const fetchUsers = async () => {
//         try {
//           const res = await api.get("/users");
//           const sales = res.data.data.filter((u) => u.role === "sales");
//           setSalesUsers(sales);
//         } catch {}
//       };
//       fetchUsers();
//     }
//   }, [user]);

//   // ---------------- Handle Edit Toggle ----------------
//   const handleEditToggle = () => {
//     setIsEditing(!isEditing);
//   };

//   // ---------------- Handle Input Change ----------------
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // ---------------- Save Lead ----------------
//   const handleSave = async () => {
//     try {
//       const res = await api.patch(`/leads/${id}`, formData);
//       setLead(res.data.data);
//       setIsEditing(false);
//     } catch {
//       alert("Failed to update lead");
//     }
//   };

//   // ---------------- Delete Lead ----------------
//   const handleDelete = async () => {
//     if (!window.confirm("Are you sure you want to delete this lead?")) return;

//     try {
//       await api.delete(`/leads/${id}`);
//       navigate("/leads");
//     } catch {
//       alert("Failed to delete lead");
//     }
//   };

//   // ---------------- Reassign Lead (Admin) ----------------
//   const handleReassign = async () => {
//     if (!selectedUser) return;

//     try {
//       await api.patch(`/leads/${id}/reassign`, {
//         assignedTo: selectedUser,
//       });
//       alert("Lead reassigned successfully");
//     } catch {
//       alert("Failed to reassign");
//     }
//   };

//   if (loading) return <p>Loading...</p>;
//   if (!lead) return <p>Lead not found</p>;

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6">Lead Details</h1>

//       <div className="bg-white shadow rounded p-6 space-y-4">
//         {!isEditing ? (
//           <>
//             <p>
//               <strong>Name:</strong> {lead.name}
//             </p>
//             <p>
//               <strong>Email:</strong> {lead.email}
//             </p>
//             <p>
//               <strong>Phone:</strong> {lead.phone}
//             </p>
//             <p>
//               <strong>Company:</strong> {lead.company}
//             </p>
//             <p>
//               <strong>Status:</strong> {lead.status}
//             </p>

//             <div className="flex gap-4 mt-4">
//               <button
//                 onClick={handleEditToggle}
//                 className="bg-blue-600 text-white px-4 py-2 rounded"
//               >
//                 Edit
//               </button>

//               <button
//                 onClick={handleDelete}
//                 className="bg-red-600 text-white px-4 py-2 rounded"
//               >
//                 Delete
//               </button>
//             </div>
//           </>
//         ) : (
//           <>
//             <input
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className="border p-2 rounded w-full"
//               placeholder="Name"
//             />

//             <input
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               className="border p-2 rounded w-full"
//               placeholder="Email"
//             />

//             <input
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               className="border p-2 rounded w-full"
//               placeholder="Phone"
//             />

//             <input
//               name="company"
//               value={formData.company}
//               onChange={handleChange}
//               className="border p-2 rounded w-full"
//               placeholder="Company"
//             />

//             <select
//               name="status"
//               value={formData.status}
//               onChange={handleChange}
//               className="border p-2 rounded w-full"
//             >
//               <option value="New">New</option>
//               <option value="Contacted">Contacted</option>
//               <option value="Qualified">Qualified</option>
//               <option value="Lost">Lost</option>
//             </select>

//             <div className="flex gap-4 mt-4">
//               <button
//                 onClick={handleSave}
//                 className="bg-green-600 text-white px-4 py-2 rounded"
//               >
//                 Save
//               </button>

//               <button
//                 onClick={handleEditToggle}
//                 className="bg-gray-500 text-white px-4 py-2 rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </>
//         )}
//       </div>

//       {/* ---------------- Admin Reassign Section ---------------- */}
//       {user?.role === "admin" && (
//         <div className="bg-white shadow rounded p-6 mt-6">
//           <h2 className="font-bold mb-4">Reassign Lead</h2>

//           <select
//             value={selectedUser}
//             onChange={(e) => setSelectedUser(e.target.value)}
//             className="border p-2 rounded w-full"
//           >
//             <option value="">Select Sales User</option>
//             {salesUsers.map((u) => (
//               <option key={u._id} value={u._id}>
//                 {u.name}
//               </option>
//             ))}
//           </select>

//           <button
//             onClick={handleReassign}
//             className="bg-purple-600 text-white px-4 py-2 rounded mt-4"
//           >
//             Reassign
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default LeadDetail;

// =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================
// =============================================================================================================================

// import React from "react";
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../api/axios";

// function LeadDetail() {
//   const { id } = useParams();

//   const [lead, setLead] = useState(null);
//   const [deals, setDeals] = useState([]);
//   const [activities, setActivities] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Activity States
//   const [activityType, setActivityType] = useState("Call");
//   const [activityDescription, setActivityDescription] = useState("");
//   const [activitySubmitting, setActivitySubmitting] = useState(false);

//   // Deal States
//   const [dealAmount, setDealAmount] = useState("");
//   const [dealStage, setDealStage] = useState("Prospect");
//   const [dealCloseDate, setDealCloseDate] = useState("");
//   const [dealSubmitting, setDealSubmitting] = useState(false);

//   // ---------------- Fetch Data ----------------
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const leadRes = await api.get(`/leads/${id}`);
//         setLead(leadRes.data.data);

//         const dealsRes = await api.get(`/deals?leadId=${id}`);
//         setDeals(dealsRes.data.data.deals || dealsRes.data.data);

//         const activityRes = await api.get(`/activity?leadId=${id}`);
//         setActivities(
//           activityRes.data.data.activities || activityRes.data.data,
//         );
//       } catch (err) {
//         alert("Failed to fetch data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [id]);

//   // ---------------- Add Activity ----------------
//   const handleAddActivity = async (e) => {
//     e.preventDefault();

//     if (!activityDescription.trim()) {
//       alert("Description is required");
//       return;
//     }

//     try {
//       setActivitySubmitting(true);

//       const res = await api.post("/activity", {
//         leadId: id,
//         type: activityType,
//         description: activityDescription,
//       });

//       setActivities((prev) => [res.data.data, ...prev]);
//       setActivityDescription("");
//     } catch (err) {
//       alert("Failed to add activity");
//     } finally {
//       setActivitySubmitting(false);
//     }
//   };

//   // ---------------- Add Deal ----------------
//   const handleAddDeal = async (e) => {
//     e.preventDefault();

//     if (!dealAmount || !dealCloseDate) {
//       alert("Amount and Close Date required");
//       return;
//     }

//     try {
//       setDealSubmitting(true);

//       const res = await api.post("/deals", {
//         leadId: id,
//         amount: Number(dealAmount),
//         stage: dealStage,
//         closeDate: dealCloseDate,
//       });

//       setDeals((prev) => [res.data.data, ...prev]);

//       setDealAmount("");
//       setDealCloseDate("");
//     } catch (err) {
//       alert("Failed to add deal");
//     } finally {
//       setDealSubmitting(false);
//     }
//   };

//   // ---------------- Update Deal Stage ----------------
//   const handleStageChange = async (dealId, newStage) => {
//     try {
//       await api.patch(`/deals/${dealId}/stage`, { stage: newStage });
//       setDeals((prev) =>
//         prev.map((deal) =>
//           deal._id === dealId ? { ...deal, stage: newStage } : deal,
//         ),
//       );
//     } catch (err) {
//       alert("Failed to update stage");
//     }
//   };

//   const getStageColor = (stage) => {
//     switch (stage) {
//       case "Prospect":
//         return "bg-yellow-500";
//       case "Negotiation":
//         return "bg-blue-500";
//       case "Won":
//         return "bg-green-500";
//       case "Lost":
//         return "bg-red-500";
//       default:
//         return "bg-gray-500";
//     }
//   };

//   if (loading) return <p>Loading...</p>;
//   if (!lead) return <p>Lead not found</p>;

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6">Lead Details</h1>

//       {/* ================= Lead Info ================= */}
//       <div className="bg-white shadow rounded p-6 space-y-4">
//         <p>
//           <strong>Name:</strong> {lead.name}
//         </p>
//         <p>
//           <strong>Email:</strong> {lead.email}
//         </p>
//         <p>
//           <strong>Phone:</strong> {lead.phone}
//         </p>
//         <p>
//           <strong>Company:</strong> {lead.company}
//         </p>
//         <p>
//           <strong>Status:</strong> {lead.status}
//         </p>
//       </div>

//       {/* ================= Deals ================= */}
//       <div className="mt-10">
//         <h2 className="text-xl font-bold mb-4">Deals</h2>

//         {/* Add Deal Form */}
//         <div className="bg-white shadow rounded p-4 mb-6">
//           <h3 className="font-semibold mb-4">Add Deal</h3>

//           <form onSubmit={handleAddDeal} className="flex gap-4 items-center">
//             <input
//               type="number"
//               placeholder="Amount"
//               value={dealAmount}
//               onChange={(e) => setDealAmount(e.target.value)}
//               className="border p-2 rounded w-40"
//             />

//             <select
//               value={dealStage}
//               onChange={(e) => setDealStage(e.target.value)}
//               className="border p-2 rounded"
//             >
//               <option value="Prospect">Prospect</option>
//               <option value="Negotiation">Negotiation</option>
//               <option value="Won">Won</option>
//               <option value="Lost">Lost</option>
//             </select>

//             <input
//               type="date"
//               value={dealCloseDate}
//               onChange={(e) => setDealCloseDate(e.target.value)}
//               className="border p-2 rounded"
//             />

//             <button
//               type="submit"
//               disabled={dealSubmitting}
//               className="bg-green-600 text-white px-4 py-2 rounded"
//             >
//               {dealSubmitting ? "Adding..." : "Add"}
//             </button>
//           </form>
//         </div>

//         {/* Deals Table */}
//         {deals.length === 0 ? (
//           <p className="text-gray-500 italic">No deals yet.</p>
//         ) : (
//           <div className="bg-white shadow rounded p-4">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b text-left">
//                   <th className="py-2">Amount</th>
//                   <th>Stage</th>
//                   <th>Close Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {deals.map((deal) => (
//                   <tr key={deal._id} className="border-b">
//                     <td className="py-2">₹ {deal.amount}</td>

//                     <td>
//                       <select
//                         value={deal.stage}
//                         onChange={(e) =>
//                           handleStageChange(deal._id, e.target.value)
//                         }
//                         className={`text-white px-2 py-1 rounded ${getStageColor(
//                           deal.stage,
//                         )}`}
//                       >
//                         <option value="Prospect">Prospect</option>
//                         <option value="Negotiation">Negotiation</option>
//                         <option value="Won">Won</option>
//                         <option value="Lost">Lost</option>
//                       </select>
//                     </td>

//                     <td>{new Date(deal.closeDate).toLocaleDateString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* ================= Activities ================= */}
//       <div className="mt-10">
//         <h2 className="text-xl font-bold mb-4">Activities</h2>

//         {/* Add Activity Form */}
//         <div className="bg-white shadow rounded p-4 mb-6">
//           <h3 className="font-semibold mb-4">Add Activity</h3>

//           <form
//             onSubmit={handleAddActivity}
//             className="flex gap-4 items-center"
//           >
//             <select
//               value={activityType}
//               onChange={(e) => setActivityType(e.target.value)}
//               className="border p-2 rounded"
//             >
//               <option value="Call">Call</option>
//               <option value="Meeting">Meeting</option>
//               <option value="Note">Note</option>
//               <option value="Follow-up">Follow-up</option>
//             </select>

//             <input
//               type="text"
//               placeholder="Description"
//               value={activityDescription}
//               onChange={(e) => setActivityDescription(e.target.value)}
//               className="border p-2 rounded flex-1"
//             />

//             <button
//               type="submit"
//               disabled={activitySubmitting}
//               className="bg-blue-600 text-white px-4 py-2 rounded"
//             >
//               {activitySubmitting ? "Adding..." : "Add"}
//             </button>
//           </form>
//         </div>

//         {/* Activities Table */}
//         {activities.length === 0 ? (
//           <p className="text-gray-500 italic">No activities yet.</p>
//         ) : (
//           <div className="bg-white shadow rounded p-4">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b text-left">
//                   <th className="py-2">Type</th>
//                   <th>Description</th>
//                   <th>Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {activities.map((activity) => (
//                   <tr key={activity._id} className="border-b">
//                     <td className="py-2">{activity.type}</td>
//                     <td>{activity.description}</td>
//                     <td>{new Date(activity.createdAt).toLocaleDateString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default LeadDetail;
