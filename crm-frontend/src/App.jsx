import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import Deals from "./pages/Deals";
import Activities from "./pages/Activities";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/Layout";
import Users from "./pages/Users";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/leads"
        element={
          <ProtectedRoute>
            <Layout>
              <Leads />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/leads/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <LeadDetail />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/deals"
        element={
          <ProtectedRoute>
            <Layout>
              <Deals />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/activities"
        element={
          <ProtectedRoute>
            <Layout>
              <Activities />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Leads from "./pages/Leads";
// import LeadDetail from "./pages/LeadDetail";
// import ProtectedRoute from "./routes/ProtectedRoute";
// import Layout from "./components/Layout";
// import Activities from "./pages/Activities";
// import Deals from "./pages/Deals";

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Login />} />

//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <Layout>
//               <Dashboard />
//             </Layout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/leads"
//         element={
//           <ProtectedRoute>
//             <Layout>
//               <Leads />
//             </Layout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/leads/:id"
//         element={
//           <ProtectedRoute>
//             <Layout>
//               <LeadDetail />
//             </Layout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/activities"
//         element={
//           <ProtectedRoute>
//             <Layout>
//               <Activities />
//             </Layout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/deals"
//         element={
//           <ProtectedRoute>
//             <Layout>
//               <Deals />
//             </Layout>
//           </ProtectedRoute>
//         }
//       />
//     </Routes>
//   );
// }

// export default App;

// // import React from "react";
// // import { Routes, Route } from "react-router-dom";
// // import Login from "./pages/Login";
// // import Dashboard from "./pages/Dashboard";
// // import ProtectedRoute from "./routes/ProtectedRoute";
// // import Layout from "./components/Layout";
// // import Leads from "./pages/Leads";
// // import LeadDetail from "./pages/LeadDetail";

// // function App() {
// //   return (
// //     <Routes>
// //       <Route path="/" element={<Login />} />

// //       <Route
// //         path="/dashboard"
// //         element={
// //           <ProtectedRoute>
// //             <Layout>
// //               <Dashboard />
// //             </Layout>
// //           </ProtectedRoute>
// //         }
// //       />

// //       <Route
// //         path="/leads"
// //         element={
// //           <ProtectedRoute>
// //             <Layout>
// //               <Leads />
// //             </Layout>
// //           </ProtectedRoute>
// //         }
// //       />

// //       <Route
// //         path="/leads/:id"
// //         element={
// //           <ProtectedRoute>
// //             <Layout>
// //               <LeadDetail />
// //             </Layout>
// //           </ProtectedRoute>
// //         }
// //       />
// //     </Routes>
// //   );
// // }

// // export default App;
