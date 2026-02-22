import React from "react";
import { CheckCircle } from "lucide-react";

const PickupQueue = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Ready for Pickup</h1>
      <p className="text-sm text-gray-500">
        Documents that are printed and waiting for the resident.
      </p>
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
      <p className="text-gray-400">
        Residents ready to claim documents will appear here.
      </p>
    </div>
  </div>
);

export default PickupQueue;
