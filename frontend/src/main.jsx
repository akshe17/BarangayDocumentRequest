import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ZoneProvider } from "./context/ZoneContext";
import { DocumentRequestProvider } from "./context/DocumentRequestContext.jsx";
import { AdminResidentProvider } from "./context/AdminResidentContext.jsx";
// ... inside your router/layout

createRoot(document.getElementById("root")).render(
  <AdminResidentProvider>
    <DocumentRequestProvider>
      <ZoneProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ZoneProvider>
    </DocumentRequestProvider>
  </AdminResidentProvider>,
);
