import React, { useState } from "react";
import {
  FileText,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const NewRequest = () => {
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [purpose, setPurpose] = useState("");

  const documentList = [
    {
      id: "bc",
      name: "Barangay Clearance",
      fee: 50,
      desc: "Required for job applications and government IDs.",
    },
    {
      id: "coi",
      name: "Certificate of Indigency",
      fee: 0,
      desc: "For scholarship, medical, or burial assistance.",
    },
    {
      id: "cor",
      name: "Certificate of Residency",
      fee: 75,
      desc: "Proof of address for bank and government transactions.",
    },
    {
      id: "bp",
      name: "Business Permit",
      fee: 150,
      desc: "For operating small businesses or community stalls.",
    },
    {
      id: "fencing",
      name: "Fencing Permit",
      fee: 200,
      desc: "Required for property construction and boundary walling.",
    },
  ];

  const toggleDocument = (doc) => {
    if (selectedDocs.find((item) => item.id === doc.id)) {
      setSelectedDocs(selectedDocs.filter((item) => item.id !== doc.id));
    } else {
      setSelectedDocs([...selectedDocs, doc]);
    }
  };

  const totalFee = selectedDocs.reduce((acc, curr) => acc + curr.fee, 0);

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Create New Request
        </h1>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
          Select the documents you need and provide a purpose.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* DOCUMENT SELECTION AREA */}
        <div className="lg:col-span-2 space-y-4">
          <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">
            Available Documents
          </label>
          {documentList.map((doc) => {
            const isSelected = selectedDocs.find((item) => item.id === doc.id);
            return (
              <div
                key={doc.id}
                onClick={() => toggleDocument(doc)}
                className={`group p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-6 ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-600 shadow-xl shadow-emerald-100 scale-[1.01]"
                    : "bg-white border-gray-200 hover:border-emerald-400 hover:shadow-md"
                }`}
              >
                {/* HIGH CONTRAST CHECKBOX */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                    isSelected
                      ? "bg-white text-emerald-600"
                      : "bg-gray-100 text-gray-300 border border-gray-200"
                  }`}
                >
                  <CheckCircle2
                    size={24}
                    fill={isSelected ? "white" : "none"}
                    strokeWidth={3}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3
                      className={`text-base font-black uppercase tracking-tight ${isSelected ? "text-white" : "text-gray-800"}`}
                    >
                      {doc.name}
                    </h3>
                    <span
                      className={`text-sm font-black ${isSelected ? "text-emerald-50" : doc.fee === 0 ? "text-emerald-500" : "text-gray-900"}`}
                    >
                      {doc.fee === 0 ? "FREE" : `₱${doc.fee.toFixed(2)}`}
                    </span>
                  </div>
                  <p
                    className={`text-xs font-medium leading-relaxed ${isSelected ? "text-emerald-100" : "text-gray-500"}`}
                  >
                    {doc.desc}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="mt-10">
            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1">
              Purpose of Request
            </label>
            <textarea
              rows="4"
              placeholder="Please explain why you are requesting these documents (e.g., Employment, Scholarship, etc.)"
              className="w-full bg-white border-2 border-gray-200 rounded-2xl p-5 text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>
        </div>

        {/* SIDEBAR SUMMARY */}
        <div className="lg:col-span-1">
          <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 sticky top-24 shadow-2xl shadow-gray-200/50">
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-8 border-b border-gray-100 pb-5">
              Request Summary
            </h2>

            <div className="space-y-4 mb-10">
              {selectedDocs.length === 0 ? (
                <div className="text-center py-10">
                  <Info size={32} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-xs text-gray-400 font-black uppercase tracking-widest leading-relaxed">
                    No documents <br /> selected yet
                  </p>
                </div>
              ) : (
                selectedDocs.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center animate-in zoom-in-95 duration-200"
                  >
                    <span className="text-sm font-bold text-gray-600">
                      {item.name}
                    </span>
                    <span className="text-sm font-black text-gray-900">
                      ₱{item.fee.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-6 border-t-2 border-gray-50">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xs font-black text-gray-400 uppercase">
                  Grand Total
                </span>
                <span className="text-3xl font-black text-emerald-600 tracking-tighter">
                  ₱{totalFee.toFixed(2)}
                </span>
              </div>

              <button
                disabled={selectedDocs.length === 0 || !purpose}
                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-xl active:scale-95"
              >
                Confirm and Submit <ArrowRight size={18} />
              </button>

              <div className="mt-6 flex gap-3 items-start p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <AlertCircle
                  size={20}
                  className="text-amber-600 shrink-0 mt-0.5"
                />
                <p className="text-[10px] text-amber-800 font-bold uppercase leading-relaxed">
                  Notice: Prepare the exact amount. Payment is processed upon
                  claiming at the Barangay Hall.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRequest;
