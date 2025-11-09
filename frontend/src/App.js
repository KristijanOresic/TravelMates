import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChooseRole from "./ChooseRole";
import LoginSuccess from "./LoginSuccess";
import UserPage from "./UserPage";
import AdminPage from "./AdminPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChooseRole />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;