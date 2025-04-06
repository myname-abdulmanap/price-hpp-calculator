import React from "react";
import Calculator from "./components/Calculator";
import './index.css';

function App() {
  return (
    <div className="app-container">
      <div className="dashboard-container">
        <Calculator />
      </div>
    </div>
  );
}

export default App;