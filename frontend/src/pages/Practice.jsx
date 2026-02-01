import React, { useEffect } from "react";
import api from "../axious/api";
const Practice = () => {
  useEffect(() => {
    practiceFetch();
  }, []);

  const practiceFetch = async () => {
    try {
      // No more "401" if there is a token in localStorage!
      const res = await api.get("/user");
      console.log("Success! User is:", res.data);
    } catch (err) {
      console.error(
        "Auth Error:",
        err.response?.data?.message || "No token found",
      );
    }
  };

  return <div>Check the Console for User Data</div>;
};

export default Practice;
