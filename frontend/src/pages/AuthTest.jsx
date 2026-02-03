import React from "react";
import { useAuth } from "../context/AuthContext";

const AuthTest = () => {
  const { user, isAuthenticated, loading, isAdmin, isResident } = useAuth();

  return (
    <div className="p-6 m-4 border-2 border-dashed border-emerald-500 bg-emerald-50 rounded-lg">
      <h2 className="text-xl font-bold text-emerald-800 mb-4">
        🔐 Context Debugger
      </h2>

      <div className="space-y-2 font-mono text-sm">
        <p>
          <strong>Loading:</strong> {loading ? "⏳ True" : "✅ False"}
        </p>
        <p>
          <strong>Authenticated:</strong> {isAuthenticated ? "✅ Yes" : "❌ No"}
        </p>

        <hr className="border-emerald-200" />

        <p>
          <strong>User Object:</strong>
        </p>
        <pre className="bg-white p-2 rounded border border-emerald-200 overflow-auto max-h-40">
          {user ? JSON.stringify(user, null, 2) : "No user data found"}
        </pre>

        <hr className="border-emerald-200" />

        <p>
          <strong>Helper Checks:</strong>
        </p>
        <ul className="list-disc ml-5">
          <li>
            isAdmin():{" "}
            <span
              className={
                isAdmin() ? "text-green-600 font-bold" : "text-red-600"
              }
            >
              {isAdmin() ? "TRUE" : "FALSE"}
            </span>
          </li>
          <li>
            isResident():{" "}
            <span
              className={
                isResident() ? "text-green-600 font-bold" : "text-red-600"
              }
            >
              {isResident() ? "TRUE" : "FALSE"}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AuthTest;
