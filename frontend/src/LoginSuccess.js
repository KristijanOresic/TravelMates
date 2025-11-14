import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:4000/me", { withCredentials: true })
      .then(res => {
        if (res.data.role === "admin") navigate("/admin");
        else navigate("/user");
      })
      .catch(() => {
        navigate("/"); // nije login
      });
  }, [navigate]);

  return <div>Logging in...</div>;
}
