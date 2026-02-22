

import React, { useEffect, useState } from "react";
import api from "../api/axios";

function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [stage, setStage] = useState("");

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get(`/deals?stage=${stage}`);
        setDeals(res.data.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [stage]);

  const handleStageChange = async (dealId, newStage) => {
    try {
      await api.patch(`/deals/${dealId}/stage`, { stage: newStage });
      setDeals((prev) =>
        prev.map((deal) =>
          deal._id === dealId ? { ...deal, stage: newStage } : deal
        )
      );
    } catch {
      alert("Failed to update stage");
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case "Prospect": return "bg-yellow-500";
      case "Negotiation": return "bg-blue-500";
      case "Won": return "bg-green-500";
      case "Lost": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Deals</h1>

      <div className="flex gap-4 mb-6">
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Stages</option>
          <option value="Prospect">Prospect</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <div className="bg-white shadow rounded p-4">
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : error ? (
          <p className="text-center py-4 text-red-500">Failed to fetch deals</p>
        ) : deals.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No deals found</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Lead</th>
                <th>Company</th>
                <th>Amount</th>
                <th>Stage</th>
                <th>Close Date</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal._id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{deal.lead?.name || "N/A"}</td>
                  <td>{deal.lead?.company || "N/A"}</td>
                  <td>₹ {deal.amount.toLocaleString("en-IN")}</td>
                  <td>
                    <select
                      value={deal.stage}
                      onChange={(e) => handleStageChange(deal._id, e.target.value)}
                      className={`text-white px-2 py-1 rounded ${getStageColor(deal.stage)}`}
                    >
                      <option value="Prospect">Prospect</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </td>
                  <td>{deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Deals;
// import React, { useEffect, useState } from "react";
// import api from "../api/axios";

// function Deals() {
//   const [deals, setDeals] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);
//   const [stage, setStage] = useState("");

//   useEffect(() => {
//     const fetchDeals = async () => {
//       try {
//         setLoading(true);
//         setError(false);
//         const res = await api.get(`/deals?stage=${stage}`);
//         setDeals(res.data.data);
//       } catch {
//         setError(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDeals();
//   }, [stage]);

//   const handleStageChange = async (dealId, newStage) => {
//     try {
//       await api.patch(`/deals/${dealId}/stage`, { stage: newStage });
//       setDeals((prev) =>
//         prev.map((deal) =>
//           deal._id === dealId ? { ...deal, stage: newStage } : deal
//         )
//       );
//     } catch {
//       alert("Failed to update stage");
//     }
//   };

//   const getStageColor = (stage) => {
//     switch (stage) {
//       case "Prospect": return "bg-yellow-500";
//       case "Negotiation": return "bg-blue-500";
//       case "Won": return "bg-green-500";
//       case "Lost": return "bg-red-500";
//       default: return "bg-gray-500";
//     }
//   };

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6">Deals</h1>

//       <div className="flex gap-4 mb-6">
//         <select
//           value={stage}
//           onChange={(e) => setStage(e.target.value)}
//           className="border p-2 rounded"
//         >
//           <option value="">All Stages</option>
//           <option value="Prospect">Prospect</option>
//           <option value="Negotiation">Negotiation</option>
//           <option value="Won">Won</option>
//           <option value="Lost">Lost</option>
//         </select>
//       </div>

//       <div className="bg-white shadow rounded p-4">
//         {loading ? (
//           <p className="text-center py-4">Loading...</p>
//         ) : error ? (
//           <p className="text-center py-4 text-red-500">Failed to fetch deals</p>
//         ) : deals.length === 0 ? (
//           <p className="text-center py-4 text-gray-500">No deals found</p>
//         ) : (
//           <table className="w-full">
//             <thead>
//               <tr className="text-left border-b">
//                 <th className="py-2">Lead</th>
//                 <th>Company</th>
//                 <th>Amount</th>
//                 <th>Stage</th>
//                 <th>Close Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {deals.map((deal) => (
//                 <tr key={deal._id} className="border-b hover:bg-gray-50">
//                   <td className="py-2">{deal.lead?.name || "N/A"}</td>
//                   <td>{deal.lead?.company || "N/A"}</td>
//                   <td>₹ {deal.amount.toLocaleString("en-IN")}</td>
//                   <td>
//                     <select
//                       value={deal.stage}
//                       onChange={(e) => handleStageChange(deal._id, e.target.value)}
//                       className={`text-white px-2 py-1 rounded ${getStageColor(deal.stage)}`}
//                     >
//                       <option value="Prospect">Prospect</option>
//                       <option value="Negotiation">Negotiation</option>
//                       <option value="Won">Won</option>
//                       <option value="Lost">Lost</option>
//                     </select>
//                   </td>
//                   <td>{deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : "N/A"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Deals;