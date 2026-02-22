import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Users() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get("/auth/users");
      setUsers(res.data.data.filter((u) => u.role !== "admin"));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name || !formData.email || !formData.password) {
      setFormError("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    try {
      setCreating(true);
      const res = await api.post("/auth/register", {
        ...formData,
        role: "sales",
      });
      setUsers((prev) => [...prev, res.data.data]);
      setShowCreateForm(false);
      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch {
      alert("Failed to delete user");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">Failed to load users</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Users</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showCreateForm ? "Cancel" : "Add Sales User"}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white shadow rounded p-6 mb-6 max-w-md">
          <h2 className="font-bold text-lg mb-4">Create Sales User</h2>

          {formError && <p className="text-red-500 mb-4">{formError}</p>}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <input
              type="text"
              placeholder="Name *"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
            <input
              type="password"
              placeholder="Password * (min 6 characters)"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded p-4">
        {users.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No sales users found</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{u.name}</td>
                  <td>{u.email}</td>
                  <td className="capitalize">{u.role}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Users;
