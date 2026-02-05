import React, { useState, useEffect } from "react";
import api from "../axious/api";

const Practice = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const practiceFetch = async () => {
      try {
        setLoading(true);
        // This call automatically includes the Bearer token thanks to our interceptor
        const res = await api.get("/user");

        console.log("Full Response:", res);
        setData(res.data);
      } catch (err) {
        console.error("Fetch Error:", err);
        // Catching the specific message from Laravel
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    practiceFetch();
  }, []);

  if (loading) return <p>Connecting to Laravel...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc" }}>
      <h2>Server Response:</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Practice;
