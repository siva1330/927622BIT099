import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Heatmap from "./components/Heatmap";
import StockPage from "./pages/StockPage"; // assuming this is your stock chart page

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StockPage />} />
        <Route path="/heatmap" element={<Heatmap />} />
      </Routes>
    </Router>
  );
};

export default App;
