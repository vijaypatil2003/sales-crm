import React, { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      login(res.data.data);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-md w-96"
        >
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src="/mobicloud_logo.png"
              alt="MobiCloud Logo"
              className="h-16 object-contain"
            />
          </div>

          <h2 className="text-2xl font-bold mb-6 text-center">
            Sales CRM Login
          </h2>

          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}


export default Login;
// import React from "react";

// import { useState } from "react";
// import api from "../api/axios";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await api.post("/auth/login", { email, password });

//       login(res.data.data);
//       navigate("/dashboard");
//     } catch (err) {
//       alert(err.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-pink-50">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded-xl shadow-md w-96"
//       >
//         <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

//         <input
//           type="email"
//           placeholder="Email"
//           className="w-full mb-4 p-2 border rounded"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           className="w-full mb-6 p-2 border rounded"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
//         >
//           Login
//         </button>
//       </form>
//     </div>
//   );
// }

// export default Login;
