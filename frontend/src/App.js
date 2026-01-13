import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register"; 
import ChooseRole from "./pages/ChooseRole"; 
import LoginSuccess from "./LoginSuccess";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";
import EditorPage from "./pages/EditorPage";
import MapPage from "./pages/MapPage";
import "./App.css";

function App() {
  return (
    <Router>
      <img 
        src="/tmlogo.png"       
        alt="Logo"
        className="top-left-logo"
      />
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/secret-admin-register" element={<ChooseRole />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </Router>
  );
}

export default App;