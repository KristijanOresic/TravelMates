import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginSuccess() {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  useEffect(() => {
    axios.get(`${BACKEND_URL}/me`, { withCredentials: true })
      .then(res => {
        if (res.data.role === "admin") {
          navigate("/admin");
        } else if (res.data.role === "editor") {
          navigate("/editor");
        } else {
          navigate("/user");
        }
      })
      .catch(() => {
        navigate("/"); 
      });
  }, [navigate, BACKEND_URL]);

  return <div>Logging in...</div>;
}