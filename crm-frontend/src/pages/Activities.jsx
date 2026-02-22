import React, { useEffect, useState } from "react";
import api from "../api/axios";

function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get(`/activity?type=${type}&page=${page}&limit=${limit}`);
        setActivities(res.data.data.activities);
        setTotalPages(res.data.data.totalPages);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [type, page]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Activities</h1>

      <div className="flex gap-4 mb-6">
        <select
          value={type}
          onChange={(e) => { setPage(1); setType(e.target.value); }}
          className="border p-2 rounded"
        >
          <option value="">All Types</option>
          <option value="Call">Call</option>
          <option value="Meeting">Meeting</option>
          <option value="Note">Note</option>
          <option value="Follow-up">Follow-up</option>
        </select>
      </div>

      <div className="bg-white shadow rounded p-4">
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : error ? (
          <p className="text-center py-4 text-red-500">Failed to fetch activities</p>
        ) : activities.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No activities found</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Type</th>
                <th>Description</th>
                <th>Lead</th>
                <th>Created By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity._id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{activity.type}</td>
                  <td>{activity.description}</td>
                  <td>{activity.lead?.name || "N/A"}</td>
                  <td>{activity.createdBy?.name || "N/A"}</td>
                  <td>{new Date(activity.createdAt).toLocaleDateString()}</td>
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
        <span>Page {page} of {totalPages}</span>
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

export default Activities;