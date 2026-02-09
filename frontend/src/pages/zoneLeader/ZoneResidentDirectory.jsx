import React from "react";
import { Search, MapPin } from "lucide-react";

const ZoneResidentDirectory = () => {
  const residents = [
    { name: "Juan Dela Cruz", address: "123 Main St", contact: "09123456789" },
    { name: "Maria Santos", address: "124 Main St", contact: "09123456780" },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-950">Resident Directory</h1>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search resident..."
            className="pl-10 pr-4 py-2 border rounded-xl w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Address</th>
              <th className="p-4">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {residents.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{r.name}</td>
                <td className="p-4 text-gray-600 flex items-center gap-1">
                  <MapPin size={16} />
                  {r.address}
                </td>
                <td className="p-4 text-gray-600">{r.contact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ZoneResidentDirectory;
