import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChooseRole from "./pages/ChooseRole";
import LoginSuccess from "./LoginSuccess";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";
import MapPage from "./pages/MapPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChooseRole />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </Router>
  );
}

export default App;