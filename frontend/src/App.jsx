import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register.jsx"; 
import ChooseRole from "./pages/ChooseRole.jsx"; 
import LoginSuccess from "./LoginSuccess.jsx";
import UserPage from "./pages/UserPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import EditorPage from "./pages/EditorPage.jsx";
import MapPage from "./pages/MapPage.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";
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
        <Route path="/favorites" element={<FavoritesPage />} />
      </Routes>
    </Router>
  );
}

export default App;