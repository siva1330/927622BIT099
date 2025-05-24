// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Heatmap from "./components/Heatmap";
import ChartPage from "./components/ChartPage"; // Replace with your chart component

function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", background: "#f0f0f0" }}>
        <Link to="/" style={{ marginRight: "20px" }}>Chart</Link>
        <Link to="/heatmap">Heatmap</Link>
      </nav>

      <Routes>
        <Route path="/" element={<ChartPage />} />
        <Route path="/heatmap" element={<Heatmap />} />
      </Routes>
    </Router>
  );
}

export default App;
