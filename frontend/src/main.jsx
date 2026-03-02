import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ZoneProvider } from "./context/ZoneContext";
import { DocumentRequestProvider } from "./context/DocumentRequestContext.jsx";
import { AdminResidentProvider } from "./context/AdminResidentContext.jsx";
import { ResidentDashboardProvider } from "./context/ResidentDashboardContext.jsx";
import { NewRequestProvider } from "./context/NewRequestContext.jsx";
import { ResidentHistoryProvider } from "./context/ResidentHistoryContext.jsx";
import { ResidentNotificationsProvider } from "./context/ResidentNotificationsContext.jsx";
import { ZoneResidentProvider } from "./context/ZoneResidentContext.jsx";
// ... inside your router/layout

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ZoneResidentProvider>
      <ResidentNotificationsProvider>
        <ResidentHistoryProvider>
          <ResidentDashboardProvider>
            <NewRequestProvider>
              <AdminResidentProvider>
                <DocumentRequestProvider>
                  <ZoneProvider>
                    <App />
                  </ZoneProvider>
                </DocumentRequestProvider>
              </AdminResidentProvider>
            </NewRequestProvider>
          </ResidentDashboardProvider>
        </ResidentHistoryProvider>
      </ResidentNotificationsProvider>
    </ZoneResidentProvider>
  </AuthProvider>,
);
