import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* Rutas futuras: /login, /signup, etc. */}
      </Routes>
    </Router>
  );
};

export default App;
