import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HostPage from "./pages/HostPage";
import JoinPage from "./pages/JoinPage";
import BoardPage from "./pages/BoardPage";

export default function App() {
  return (
    <Router>
      <nav style={{ padding: 10, background: "#fafafa", borderBottom: "1px solid #eee" }}>
        <Link to="/" style={{ marginRight: 10 }}>Home</Link>
        <Link to="/host" style={{ marginRight: 10 }}>Host</Link>
        <Link to="/join" style={{ marginRight: 10 }}>Join (Pen)</Link>
        <Link to="/board" style={{ marginRight: 10 }}>Board (manual)</Link>
      </nav>
      <div style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<div>
            <h2>PhonePen — Home</h2>
            <p>Use Host to create room, Join to connect a pen device, and Board to view.</p>
          </div>} />
          <Route path="/host" element={<HostPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/board" element={<BoardPage />} />
        </Routes>
      </div>
    </Router>
  );
}
