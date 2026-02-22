import React from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-500 mb-8">Page not found</p>
      <button
        onClick={() => navigate("/dashboard")}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Go to Dashboard
      </button>
    </div>
  );
}

export default NotFound;
