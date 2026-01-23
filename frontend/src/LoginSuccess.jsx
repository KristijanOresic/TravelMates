import { useSearchParams } from "react-router-dom";

export default function LoginSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fromOauth = params.get("from") === "oauth";

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  useEffect(() => {
    if (!fromOauth) {
      navigate("/"); // 🚫 zabranjen direktan ulaz
      return;
    }

    axios
      .get(`${BACKEND_URL}/me`, { withCredentials: true })
      .then(res => {
        if (res.data.role === "admin") navigate("/admin");
        else if (res.data.role === "editor") navigate("/editor");
        else navigate("/user");
      })
      .catch(() => navigate("/"));
  }, [navigate, BACKEND_URL, fromOauth]);

  return <div>Logging in...</div>;
}
