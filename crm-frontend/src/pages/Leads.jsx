import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Leads() {
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [salesUsers, setSalesUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    assignedTo: "",
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const limit = 5;

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get(
          `/leads?page=${page}&limit=${limit}&search=${search}&status=${status}`,
        );
        setLeads(res.data.data.leads);
        setTotalPages(res.data.data.totalPages);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [page, search, status]);

  useEffect(() => {
    if (user?.role === "admin") {
      const fetchSalesUsers = async () => {
        try {
          const res = await api.get("/auth/users");
          setSalesUsers(res.data.data.filter((u) => u.role !== "admin"));
        } catch {}
      };
      fetchSalesUsers();
    }
  }, [user]);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Name is required");
      return;
    }
    if (!formData.email && !formData.phone) {
      alert("Either email or phone is required");
      return;
    }
    if (user?.role === "admin" && !formData.assignedTo) {
      alert("Please select a sales person");
      return;
    }

    try {
      setCreating(true);
      const res = await api.post("/leads", formData);
      setLeads((prev) => [res.data.data, ...prev]);
      setShowCreateForm(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        assignedTo: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create lead");
    } finally {
      setCreating(false);
    }
  };

  console.log("Current user:", user);
  console.log("User role:", user?.role);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showCreateForm ? "Cancel" : "Add Lead"}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white shadow rounded p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">Create New Lead</h2>
          <form onSubmit={handleCreateLead} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name *"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Company"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              className="border p-2 rounded"
            />
            {user?.role === "admin" && (
              <select
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
                className="border p-2 rounded col-span-2"
              >
                <option value="">Select Sales Person *</option>
                {salesUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} — {u.email}
                  </option>
                ))}
              </select>
            )}
            <button
              type="submit"
              disabled={creating}
              className="col-span-2 bg-green-600 text-white py-2 rounded disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Lead"}
            </button>
          </form>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="border p-2 rounded w-64"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <div className="bg-white shadow rounded p-4">
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : error ? (
          <p className="text-center py-4 text-red-500">Failed to fetch leads</p>
        ) : leads.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No leads found</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Status</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead._id}
                  className="border-b hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/leads/${lead._id}`)}
                >
                  <td className="py-2">{lead.name}</td>
                  <td>{lead.email || "N/A"}</td>
                  <td>{lead.company || "N/A"}</td>
                  <td>{lead.status}</td>
                  <td>{lead.assignedTo?.name || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Leads; // import React, { useEffect, useState } from "react";

// import api from "../api/axios";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// function Leads() {
//   const [leads, setLeads] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(false);

//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("");

//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [salesUsers, setSalesUsers] = useState([]);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     company: "",
//     assignedTo: "",
//   });

//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const limit = 5;

//   useEffect(() => {
//     const fetchLeads = async () => {
//       try {
//         setLoading(true);
//         setError(false);
//         const res = await api.get(
//           `/leads?page=${page}&limit=${limit}&search=${search}&status=${status}`,
//         );
//         console.log("API response:", res.data);
//         setLeads(res.data.data.leads);
//         setTotalPages(res.data.data.totalPages);
//       } catch (err) {
//         setError(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLeads();
//   }, [page, search, status]);

//   useEffect(() => {
//     if (user?.role === "admin") {
//       const fetchSalesUsers = async () => {
//         try {
//           const res = await api.get("/auth/users");
//           const sales = res.data.data.filter((u) => u.role !== "admin");
//           setSalesUsers(sales);
//         } catch {}
//       };
//       fetchSalesUsers();
//     }
//   }, [user]);

//   const handleCreateLead = async (e) => {
//     e.preventDefault();

//     if (!formData.name) {
//       alert("Name is required");
//       return;
//     }

//     if (!formData.email && !formData.phone) {
//       alert("Either email or phone is required");
//       return;
//     }

//     if (user?.role === "admin" && !formData.assignedTo) {
//       alert("Please select a sales user to assign");
//       return;
//     }

//     try {
//       setCreating(true);
//       const res = await api.post("/leads", formData);
//       setLeads((prev) => [res.data.data, ...prev]);
//       setShowCreateForm(false);
//       setFormData({
//         name: "",
//         email: "",
//         phone: "",
//         company: "",
//         assignedTo: "",
//       });
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to create lead");
//     } finally {
//       setCreating(false);
//     }
//   };

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Leads</h1>
//         <button
//           onClick={() => setShowCreateForm(!showCreateForm)}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           {showCreateForm ? "Cancel" : "Add Lead"}
//         </button>
//       </div>

//       {showCreateForm && (
//         <div className="bg-white shadow rounded p-6 mb-6">
//           <h2 className="font-bold text-lg mb-4">Create New Lead</h2>
//           <form onSubmit={handleCreateLead} className="grid grid-cols-2 gap-4">
//             <input
//               type="text"
//               placeholder="Name *"
//               value={formData.name}
//               onChange={(e) =>
//                 setFormData({ ...formData, name: e.target.value })
//               }
//               className="border p-2 rounded"
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               value={formData.email}
//               onChange={(e) =>
//                 setFormData({ ...formData, email: e.target.value })
//               }
//               className="border p-2 rounded"
//             />
//             <input
//               type="text"
//               placeholder="Phone"
//               value={formData.phone}
//               onChange={(e) =>
//                 setFormData({ ...formData, phone: e.target.value })
//               }
//               className="border p-2 rounded"
//             />
//             <input
//               type="text"
//               placeholder="Company"
//               value={formData.company}
//               onChange={(e) =>
//                 setFormData({ ...formData, company: e.target.value })
//               }
//               className="border p-2 rounded"
//             />

//             {user?.role === "admin" && (
//               <select
//                 value={formData.assignedTo}
//                 onChange={(e) =>
//                   setFormData({ ...formData, assignedTo: e.target.value })
//                 }
//                 className="border p-2 rounded col-span-2"
//               >
//                 <option value="">Select Sales Person *</option>
//                 {salesUsers.map((u) => (
//                   <option key={u._id} value={u._id}>
//                     {u.name} — {u.email}
//                   </option>
//                 ))}
//               </select>
//             )}

//             <button
//               type="submit"
//               disabled={creating}
//               className="col-span-2 bg-green-600 text-white py-2 rounded disabled:opacity-50"
//             >
//               {creating ? "Creating..." : "Create Lead"}
//             </button>
//           </form>
//         </div>
//       )}

//       <div className="flex gap-4 mb-6">
//         <input
//           type="text"
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => {
//             setPage(1);
//             setSearch(e.target.value);
//           }}
//           className="border p-2 rounded w-64"
//         />
//         <select
//           value={status}
//           onChange={(e) => {
//             setPage(1);
//             setStatus(e.target.value);
//           }}
//           className="border p-2 rounded"
//         >
//           <option value="">All Status</option>
//           <option value="New">New</option>
//           <option value="Contacted">Contacted</option>
//           <option value="Qualified">Qualified</option>
//           <option value="Lost">Lost</option>
//         </select>
//       </div>

//       <div className="bg-white shadow rounded p-4">
//         {loading ? (
//           <p className="text-center py-4">Loading...</p>
//         ) : error ? (
//           <p className="text-center py-4 text-red-500">Failed to fetch leads</p>
//         ) : leads.length === 0 ? (
//           <p className="text-center py-4 text-gray-500">No leads found</p>
//         ) : (
//           <table className="w-full">
//             <thead>
//               <tr className="text-left border-b">
//                 <th className="py-2">Name</th>
//                 <th>Email</th>
//                 <th>Company</th>
//                 <th>Status</th>
//                 <th>Assigned To</th>
//               </tr>
//             </thead>
//             <tbody>
//               {leads.map((lead) => (
//                 <tr
//                   key={lead._id}
//                   className="border-b hover:bg-gray-100 cursor-pointer"
//                   onClick={() => navigate(`/leads/${lead._id}`)}
//                 >
//                   <td className="py-2">{lead.name}</td>
//                   <td>{lead.email || "N/A"}</td>
//                   <td>{lead.company || "N/A"}</td>
//                   <td>{lead.status}</td>
//                   <td>{lead.assignedTo?.name || "N/A"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       <div className="flex justify-between mt-6">
//         <button
//           onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
//           disabled={page === 1}
//           className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
//         >
//           Previous
//         </button>
//         <span>
//           Page {page} of {totalPages}
//         </span>
//         <button
//           onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
//           disabled={page === totalPages}
//           className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Leads;

// =========================================================================================================================
// ====================================================================================================================
// =================================================================================================================================
// =======================================================================================================================

// import React from "react";
// import { useEffect, useState } from "react";
// import api from "../api/axios";
// import { useNavigate } from "react-router-dom";

// function Leads() {
//   const [leads, setLeads] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);

//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("");

//   const navigate = useNavigate();

//   const limit = 5;

//   useEffect(() => {
//     const fetchLeads = async () => {
//       try {
//         setLoading(true);

//         const res = await api.get(
//           `/leads?page=${page}&limit=${limit}&search=${search}&status=${status}`,
//         );

//         setLeads(res.data.data.leads || res.data.data);
//         setTotalPages(res.data.data.totalPages || 1);
//       } catch (err) {
//         alert("Failed to fetch leads");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLeads();
//   }, [page, search, status]);

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6">Leads</h1>

//       {/* Filters */}
//       <div className="flex gap-4 mb-6">
//         <input
//           type="text"
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => {
//             setPage(1);
//             setSearch(e.target.value);
//           }}
//           className="border p-2 rounded w-64"
//         />

//         <select
//           value={status}
//           onChange={(e) => {
//             setPage(1);
//             setStatus(e.target.value);
//           }}
//           className="border p-2 rounded"
//         >
//           <option value="">All Status</option>
//           <option value="New">New</option>
//           <option value="Contacted">Contacted</option>
//           <option value="Qualified">Qualified</option>
//           <option value="Lost">Lost</option>
//         </select>
//       </div>

//       {/* Table */}
//       <div className="bg-white shadow rounded p-4">
//         {loading ? (
//           <p className="text-center py-4">Loading...</p>
//         ) : (
//           <table className="w-full">
//             <thead>
//               <tr className="text-left border-b">
//                 <th className="py-2">Name</th>
//                 <th>Email</th>
//                 <th>Company</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {leads.map((lead) => (
//                 <tr
//                   key={lead._id}
//                   className="border-b hover:bg-gray-100 cursor-pointer"
//                   onClick={() => navigate(`/leads/${lead._id}`)}
//                 >
//                   <td className="py-2">{lead.name}</td>
//                   <td>{lead.email}</td>
//                   <td>{lead.company}</td>
//                   <td>{lead.status}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Pagination */}
//       <div className="flex justify-between mt-6">
//         <button
//           onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
//           disabled={page === 1}
//           className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
//         >
//           Previous
//         </button>

//         <span>
//           Page {page} of {totalPages}
//         </span>

//         <button
//           onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
//           disabled={page === totalPages}
//           className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Leads;
