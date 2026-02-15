import React from "react";

const CaptainDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800">
        Dashboard Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Placeholder cards */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500">Total Residents</p>
          <p className="text-3xl font-bold">1,250</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500">Pending Requests</p>
          <p className="text-3xl font-bold text-sky-600">12</p>
        </div>
      </div>
    </div>
  );
};

export default CaptainDashboard;
