import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "./Footer";

function Layout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/leads", label: "Leads" },
    { to: "/deals", label: "Deals" },
    { to: "/activities", label: "Activities" },
    ...(user?.role === "admin" ? [{ to: "/users", label: "Users" }] : []),
    { to: "/profile", label: "Profile" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-blue-100 text-black p-6 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="mb-8">
            <img
              src="/mobicloud_logo.png"
              alt="MobiCloud Logo"
              className="h-12 object-contain"
            />
            <span className="text-2xl font-bold text-blue-900">Sales CRM</span>
          </div>

          {/* Nav Links */}
          <ul className="space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`block px-3 py-2 rounded-lg font-semibold transition-all duration-200
                      ${
                        isActive
                          ? "bg-blue-300 text-black"
                          : "text-black hover:bg-blue-200 hover:text-blue-900"
                      }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Profile Section */}
        <div className="border-t border-blue-200 pt-4">
          <p className="text-sm font-semibold text-blue-900">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize mb-3">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-gray-100 p-8">{children}</div>
        <Footer />
      </div>{" "}
    </div>
  );
}

export default Layout;

// import React from "react";

// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";

// function Layout({ children }) {
//   const { logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate("/");
//   };

//   return (
//     <div className="flex min-h-screen">
//       {/* Sidebar */}
//       <div className="w-64 bg-gray-900 text-white p-6">
//         <h2 className="text-xl font-bold mb-8">Sales CRM</h2>

//         <ul className="space-y-4">
//           <li>
//             <Link to="/dashboard" className="hover:text-blue-400">
//               Dashboard
//             </Link>
//           </li>

//           <li>
//             <Link to="/leads" className="hover:text-blue-400">
//               Leads
//             </Link>
//           </li>

//           <li>
//             <Link to="/deals" className="hover:text-blue-400">
//               Deals
//             </Link>
//           </li>

//           <li>
//             <Link to="/activities" className="hover:text-blue-400">
//               Activities
//             </Link>
//           </li>
//         </ul>

//         <button
//           onClick={handleLogout}
//           className="mt-10 bg-red-500 px-4 py-2 rounded hover:bg-red-600"
//         >
//           Logout
//         </button>
//       </div>

//       {/* Content */}
//       <div className="flex-1 bg-gray-100 p-8">{children}</div>
//     </div>
//   );
// }

// export default Layout;
