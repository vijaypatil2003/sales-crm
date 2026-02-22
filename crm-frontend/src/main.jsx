import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import App from "./App";
// import "./index.css";
// import { AuthProvider } from "./context/AuthContext";



// ReactDOM.createRoot(document.getElementById("root")).render(
//   <BrowserRouter>
//     <AuthProvider>
//       <App />
//     </AuthProvider>
//   </BrowserRouter>
// );
