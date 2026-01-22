import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function LoginSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("error") === "user-not-found") {
      alert("Korisnik ne postoji. Registrirajte se.");
      navigate("/"); // ili na registraciju
      return;
    }

    axios.get(`${BACKEND_URL}/me`, { withCredentials: true })
      .then(res => {
        if (res.data.role === "admin") navigate("/admin");
        else if (res.data.role === "editor") navigate("/editor");
        else navigate("/user");
      })
      .catch(() => navigate("/"));
  }, [navigate, location.search]);

  return <div>Logging in...</div>;
}
