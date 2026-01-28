import React from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";

const Documents = () => {
  const docTypes = [
    {
      id: 1,
      type: "Barangay Clearance",
      price: "₱50.00",
      requirements: "ID, Cedula",
    },
    {
      id: 2,
      type: "Certificate of Indigency",
      price: "Free",
      requirements: "None",
    },
    {
      id: 3,
      type: "Business Permit",
      price: "₱150.00",
      requirements: "DTI/SEC",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">Document Settings</h2>
        <button className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-100">
          <Plus size={18} /> New Document Type
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docTypes.map((doc) => (
          <div
            key={doc.id}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-colors group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Edit3 size={20} />
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h4 className="text-lg font-bold text-gray-800">{doc.type}</h4>
            <div className="mt-4 flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                  Price
                </p>
                <p className="text-xl font-black text-emerald-600">
                  {doc.price}
                </p>
              </div>
              <div className="text-right text-xs text-gray-500">
                Req: {doc.requirements}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;
