import React, { useState, useEffect } from "react";
import Calculator from "./components/Calculator";
import './index.css';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validUsername = "admin";
  const validPassword = "12345";

  useEffect(() => {
    // Cek apakah user sudah login
    const auth = localStorage.getItem("auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (username === validUsername && password === validPassword) {
      localStorage.setItem("auth", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Username atau password salah!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  // Handle Enter key press for login
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="app-container">
      {isAuthenticated ? (
        <div className="dashboard-container">
         
          <Calculator />

          <button 
            className="logout-button" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="login-container">
          <div className="login-card">
            <h2>Login</h2>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyPress}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              className="login-input"
            />
            <button 
              className="login-button" 
              onClick={handleLogin}
            >
              Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;