import React, { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, login } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError("");

    if (!formData.name || !formData.email) {
      setError("Name and email are required");
      return;
    }

    try {
      setSaving(true);
      const payload = { name: formData.name, email: formData.email };
      if (formData.password) payload.password = formData.password;

      const res = await api.patch("/auth/me", payload);

      login({ user: res.data.data, token: localStorage.getItem("token") });
      setSuccess(true);
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 uppercase">
            {user?.name?.charAt(0)}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
          <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full capitalize">
            {user?.role}
          </span>
        </div>

        {/* Card */}
        <div className="bg-white shadow-md rounded-xl p-8">
          <h2 className="text-lg font-bold text-gray-700 mb-6 border-b pb-3">
            Edit Profile
          </h2>

          {success && (
            <p className="text-green-600 bg-green-50 border border-green-200 rounded p-3 mb-4 text-sm">
              ✅ Profile updated successfully
            </p>
          )}
          {error && (
            <p className="text-red-500 bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm">
              ❌ {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 mt-2"
            >
              {saving ? "Saving..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
