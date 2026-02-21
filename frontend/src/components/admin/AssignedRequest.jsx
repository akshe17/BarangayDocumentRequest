import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Clock, CheckCircle } from "lucide-react";
import api from "../../axious/api";
export const AssignedRequests = ({ documentType, onBack }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        // This assumes your backend has a relationship or filter for this
        const { data } = await api.get(
          `/document-requests?document_id=${documentType.document_id}`,
        );
        setRequests(data.data || data);
      } catch (err) {
        console.error("Failed to load assigned documents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, [documentType.document_id]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 mb-6"
      >
        <ArrowLeft size={16} /> Back to Edit
      </button>

      <h2 className="text-xl font-bold mb-2">
        Requests for {documentType.document_name}
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Viewing all resident submissions for this template.
      </p>

      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.request_id}
              className="bg-white p-4 rounded-xl border flex justify-between items-center"
            >
              <div>
                <p className="font-medium">Request #{req.request_id}</p>
                <p className="text-xs text-gray-400">
                  Date: {new Date(req.request_date).toLocaleDateString()}
                </p>
              </div>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold">
                {req.status?.status_name || "Pending"}
              </span>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-gray-400 text-center py-10">
              No requests found for this document type.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
