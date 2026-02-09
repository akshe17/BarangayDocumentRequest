import React from "react";

const ZoneMap = () => {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-950 mb-6">Zone Map</h1>
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm h-[600px] flex items-center justify-center">
        {/* Placeholder for Map - e.g., using Google Maps API or an SVG */}
        <div className="text-center text-gray-500">
          <img
            src="/placeholder-map.png"
            alt="Zone Map"
            className="max-h-96 mx-auto mb-4"
          />
          <p>Interactive Map Component Here</p>
        </div>
      </div>
    </div>
  );
};

export default ZoneMap;
