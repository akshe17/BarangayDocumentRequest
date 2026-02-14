import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ZoneProvider } from "./context/ZoneContext";
createRoot(document.getElementById("root")).render(
  <ZoneProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ZoneProvider>,
);
