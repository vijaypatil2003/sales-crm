import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;


// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// function ProtectedRoute({ children }) {
//   const { user, loading } = useAuth();

//   if (loading) return null; // Wait until auth loads

//   if (!user) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// }

// export default ProtectedRoute;
