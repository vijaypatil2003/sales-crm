import React, { useEffect, useState } from "react";
import api from "../api/axios";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");
        setStats(res.data.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <p className="p-6">Loading dashboard...</p>;
  if (error) return <p className="p-6 text-red-500">Failed to load dashboard</p>;
  if (!stats) return <p className="p-6">No data available</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white shadow rounded p-6">
          <p className="text-gray-500">Total Leads</p>
          <h2 className="text-3xl font-bold">{stats.totalLeads}</h2>
        </div>
        <div className="bg-white shadow rounded p-6">
          <p className="text-gray-500">Total Deals</p>
          <h2 className="text-3xl font-bold">{stats.totalDeals}</h2>
        </div>
        <div className="bg-white shadow rounded p-6">
          <p className="text-gray-500">Total Activities</p>
          <h2 className="text-3xl font-bold">{stats.totalActivities}</h2>
        </div>
        <div className="bg-white shadow rounded p-6">
          <p className="text-gray-500">Total Revenue</p>
          <h2 className="text-3xl font-bold text-blue-600">
            ₹ {stats.totalRevenue.toLocaleString("en-IN")}
          </h2>
        </div>
      </div>

      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-bold mb-4">Deals by Stage</h2>
        {stats.dealsByStage.length === 0 ? (
          <p className="text-gray-500 italic">No deal data available</p>
        ) : (
          <div className="space-y-4">
            {stats.dealsByStage.map((stage) => (
              <div key={stage._id} className="flex justify-between border-b pb-2">
                <span className="font-medium">{stage._id}</span>
                <span className="font-bold">{stage.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;// import React, { useEffect, useState } from "react";


// import api from "../api/axios";

// function Dashboard() {
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     const fetchDashboard = async () => {
//       try {
//         const res = await api.get("/dashboard");
//         setStats(res.data.data);
//       } catch (err) {
//         setError(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboard();
//   }, []);

//   if (loading) return <p className="p-6">Loading dashboard...</p>;
//   if (error) return <p className="p-6 text-red-500">Failed to load dashboard</p>;
//   if (!stats) return <p className="p-6">No data available</p>;

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//         <div className="bg-white shadow rounded p-6">
//           <p className="text-gray-500">Total Leads</p>
//           <h2 className="text-3xl font-bold">{stats.totalLeads}</h2>
//         </div>

//         <div className="bg-white shadow rounded p-6">
//           <p className="text-gray-500">Total Deals</p>
//           <h2 className="text-3xl font-bold">{stats.totalDeals}</h2>
//         </div>

//         <div className="bg-white shadow rounded p-6">
//           <p className="text-gray-500">Total Activities</p>
//           <h2 className="text-3xl font-bold">{stats.totalActivities}</h2>
//         </div>

//         <div className="bg-white shadow rounded p-6">
//           <p className="text-gray-500">Total Revenue</p>
//           <h2 className="text-3xl font-bold text-blue-600">
//             ₹ {stats.totalRevenue.toLocaleString("en-IN")}
//           </h2>
//         </div>
//       </div>

//       <div className="bg-white shadow rounded p-6">
//         <h2 className="text-xl font-bold mb-4">Deals by Stage</h2>
//         {stats.dealsByStage.length === 0 ? (
//           <p className="text-gray-500 italic">No deal data available</p>
//         ) : (
//           <div className="space-y-4">
//             {stats.dealsByStage.map((stage) => (
//               <div key={stage._id} className="flex justify-between border-b pb-2">
//                 <span className="font-medium">{stage._id}</span>
//                 <span className="font-bold">{stage.count}</span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Dashboard;


// import React, { useEffect, useState } from "react";
// import api from "../api/axios";

// function Dashboard() {
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     const fetchDashboard = async () => {
//       try {
//         const res = await api.get("/dashboard");
//         setStats(res.data.data);
//       } catch (err) {
//         setError(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboard();
//   }, []);

//   if (loading) return <p>Loading dashboard...</p>;
//   if (error) return <p className="text-red-500">Failed to load dashboard</p>;
//   if (!stats) return <p>No data available</p>;

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//         <div className="bg-white shadow rounded p-6">
//           <p className="text-gray-500">Total Leads</p>
//           <h2 className="text-3xl font-bold">{stats.totalLeads}</h2>
//         </div>

//         <div className="bg-white shadow rounded p-6">
//           <p className="text-gray-500">Total Deals</p>
//           <h2 className="text-3xl font-bold">{stats.totalDeals}</h2>
//         </div>

//         <div className="bg-white shadow rounded p-6">
//           <p className="text-gray-500">Total Activities</p>
//           <h2 className="text-3xl font-bold">{stats.totalActivities}</h2>
//         </div>

//         <div className="bg-white shadow rounded p-6">
//           <p className="text-gray-500">Total Revenue</p>
//           <h2 className="text-3xl font-bold text-blue-600">
//             ₹ {stats.totalRevenue.toLocaleString("en-IN")}
//           </h2>
//         </div>
//       </div>

//       <div className="bg-white shadow rounded p-6">
//         <h2 className="text-xl font-bold mb-4">Deals by Stage</h2>

//         {stats.dealsByStage.length === 0 ? (
//           <p className="text-gray-500 italic">No deal data available</p>
//         ) : (
//           <div className="space-y-4">
//             {stats.dealsByStage.map((stage) => (
//               <div
//                 key={stage._id}
//                 className="flex justify-between border-b pb-2"
//               >
//                 <span className="font-medium">{stage._id}</span>
//                 <span className="font-bold">{stage.count}</span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Dashboard;
