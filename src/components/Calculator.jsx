import React, { useState, useEffect } from "react";
import ThemeToggle from "./DarkMode";
import bcrypt from "bcryptjs";

// Import JSON data
import ProNoteData from "../data/ProNote.json";
import BPSData from "../data/BPS.json";
import CompassData from "../data/CompassAssetManager.json";
import IndonesiaCities from "../data/IndonesiaCities.json";

function Calculator() {
  const [selectedProductLine, setSelectedProductLine] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedModel, setSelectedModel] = useState(null);
  const [items, setItems] = useState([]);
  const [laborCost, setLaborCost] = useState(0);
  const [rentCost, setRentCost] = useState(0);
  const [profitMargin, setProfitMargin] = useState(15);
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    return savedDarkMode !== null ? savedDarkMode === "true" : false;
  });

  // Shipping state
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [shippingCost, setShippingCost] = useState(0);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Example Demo Accounts
  const validUsername =
    "$2b$10$bqbzXOH/PMVO0go13o9jYeZXcSICBOeWDSvgh/sIi5P/RtMG9WwhK";
  const validPassword =
    "$2b$10$b2FUfNLIYV5gcErelmNNDulAJXDmvyxvcQLPvCQjyUXp.A6U5me4q";

  useEffect(() => {
    // Check if user is already logged in
    const auth = localStorage.getItem("auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    const isUsernameMatch = bcrypt.compareSync(username, validUsername);
    const isPasswordMatch = bcrypt.compareSync(password, validPassword);

    if (isUsernameMatch && isPasswordMatch) {
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
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Reset dependent dropdowns when product line changes
  useEffect(() => {
    setSelectedProductType("");
    setSelectedCategory("");
    setSelectedModel(null);
  }, [selectedProductLine]);

  // Reset dependent dropdowns when product type changes
  useEffect(() => {
    setSelectedCategory("");
    setSelectedModel(null);
  }, [selectedProductType]);

  // Reset model when category changes
  useEffect(() => {
    setSelectedModel(null);
  }, [selectedCategory]);

  // Reset city when province changes
  useEffect(() => {
    setSelectedCity("");
    setShippingCost(0);
  }, [selectedProvince]);

  // Main product lines from PDF
  const productLines = ["ProNote", "BPS C1", "BPS C2", "BPS C5", "BPS C6", "CompassAssetManager"];

  // Get product types for each product line (based on PDF structure)
  const getProductTypesForProductLine = () => {
    switch (selectedProductLine) {
      case "ProNote":
        return ["System Configurations", "Hardware Options"];
      case "BPS C1":
      case "BPS C2":
      case "BPS C5":
      case "BPS C6":
        return ["System Configurations", "Hardware Options", "Software Options", "Service"];
      case "CompassAssetManager":
        return ["Starter", "Premium"];
      default:
        return [];
    }
  };

  // Get categories for selected product type
  const getCategoriesForProductType = () => {
    // This would be based on your JSON structure and PDF categories
    switch (selectedProductType) {
      case "System Configurations":
        if (selectedProductLine === "ProNote") {
          return ["ProNote 1.5", "ProNote 1.5F"];
        } else if (selectedProductLine === "BPS C1") {
          return ["BPS C1", "BPS C1s"];
        } else if (selectedProductLine === "BPS C2") {
          return ["BPS C2-2", "BPS C2-3", "BPS C2-4"];
        } else if (selectedProductLine === "BPS C5") {
          return ["BPS C5-5", "BPS C5-9", "BPS C5-13", "BPS C5-17", "BPS C5-21", "BPS C5-25", "BPS C5-1B"];
        } else if (selectedProductLine === "BPS C6") {
          return ["BPS C6-4", "BPS C6-8"];
        }
        return [];
      case "Hardware Options":
        if (selectedProductLine === "ProNote") {
          return ["External display", "Thermal printer"];
        } else if (selectedProductLine.startsWith("BPS")) {
          return ["External display", "Thermal printer", "Barcode reader", "UPS", "GUI arm", "Stand", "Traffic light"];
        }
        return [];
      case "Software Options":
        if (selectedProductLine.startsWith("BPS")) {
          return ["Currency Adaptation", "Serial number reading", "Ticket reading", "Fast Deposit Processing", "Video surveillance interface"];
        }
        return [];
      case "Service":
        return ["License key creation", "Activation file creation"];
      case "Starter":
      case "Premium":
        return ["Set-up fee", "Annual subscription fee"];
      default:
        return [];
    }
  };

  // This function would extract the appropriate models from your JSON data
  // based on the selected product line, type, and category
  const getModelsForCategory = () => {
    if (!selectedProductLine || !selectedProductType || !selectedCategory) return [];

    // This is a simplified version - you'll need to map this to your actual JSON structure
    try {
      // For example purposes - you'll need to adjust this based on your actual JSON structure
      let productsArray = [];
      
      // For BPS series
      if (selectedProductLine.startsWith("BPS")) {
        // Get the right BPS type from your JSON (e.g., BPS C1, BPS C2, etc.)
        const bpsTypeData = BPSData.BPS[selectedProductLine.replace(" ", "")];
        
        if (bpsTypeData && bpsTypeData.items) {
          // Find the category that matches the selected type (System Configurations, Hardware Options, etc.)
          const categoryData = bpsTypeData.items.find(item => item.category === selectedProductType);
          
          if (categoryData && categoryData.products) {
            // Filter products that match the selected category (specific models)
            productsArray = categoryData.products.filter(product => 
              product.name.includes(selectedCategory) || 
              product.description.includes(selectedCategory)
            );
          }
        }
      }
      // Handle ProNote similarly
      else if (selectedProductLine === "ProNote") {
        const proNoteData = ProNoteData.ProNote;
        if (selectedProductType === "System Configurations") {
          productsArray = proNoteData.Models?.filter(model => 
            model.name.includes(selectedCategory)
          ) || [];
        } else if (selectedProductType === "Hardware Options") {
          if (selectedCategory === "External display") {
            productsArray = proNoteData.ExternalDisplays || [];
          } else if (selectedCategory === "Thermal printer") {
            productsArray = proNoteData.Printers || [];
          }
        }
      }
      // Handle Compass Asset Manager
      else if (selectedProductLine === "CompassAssetManager") {
        productsArray = CompassData.CompassAssetManager[selectedProductType] || [];
      }

      return productsArray.map(product => ({
        id: product.id || product.materialNumber,
        name: product.name || product.description,
        price: product.price,
        description: product.description || ""
      }));
    } catch (error) {
      console.error("Error getting models for category:", error);
      return [];
    }
  };

  // Add item to list
  const addItem = () => {
    if (selectedModel) {
      // Check if the model is already in the list
      const isModelAlreadyAdded = items.some(
        (item) => item.id === selectedModel.id
      );

      if (!isModelAlreadyAdded) {
        setItems([
          ...items,
          {
            ...selectedModel,
            price: selectedModel.price,
          },
        ]);
      } else {
        alert("Model ini sudah ditambahkan sebelumnya.");
      }
    }
  };

  // Remove item from list
  const removeItem = (indexToRemove) => {
    setItems(items.filter((_, index) => index !== indexToRemove));
  };

  // Calculate total costs
  const totalMaterialCost = items.reduce(
    (acc, item) => acc + Number(item.price),
    0
  );
  const totalHPP = totalMaterialCost + Number(laborCost) + Number(rentCost);
  const sellingPrice =
    totalHPP + totalHPP * (profitMargin / 100) + Number(shippingCost);

  // Get provinces
  const provinces = Object.keys(IndonesiaCities);

  // Get cities for selected province
  const getCitiesForProvince = () => {
    return selectedProvince ? IndonesiaCities[selectedProvince] : [];
  };

  // Calculate shipping cost
  const calculateShippingCost = (city) => {
    if (!city || !city.region) {
      return 0;
    }

    const baseRate = 50000; // Base shipping rate
    const distanceMultiplier = {
      Jabodetabek: 1,
      Jawa: 1.5,
      "Luar Jawa": 2.5,
    };

    // Calculate based on region with fallback
    const region = city.region;
    const multiplier =
      distanceMultiplier[region] || distanceMultiplier["Luar Jawa"];
    return Math.round(baseRate * multiplier);
  };

  // Render login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={`app-wrapper ${darkMode ? "dark-theme" : "light-theme"}`}>
        <div className="container">
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

          <div className="login-container">
            <h2>Login</h2>
            <div className="input-group">
              <label>Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="input-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button onClick={handleLogin} className="login-button">
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main calculator UI (only shown when authenticated)
  return (
    <div className={`app-wrapper ${darkMode ? "dark-theme" : "light-theme"}`}>
      <div className="container">
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

        <div className="header-container">
          <h2>Configurator</h2>
        </div>

        <div className="calculator-layout">
          {/* Product Selection Section */}
          <div className="selection-column">
            <h3>Pilih Produk</h3>
            <div className="configurator-grid">
              {/* Product Line Dropdown */}
              <div className="input-group">
                <label>Pilih Produk / Mesin</label>
                <select
                  value={selectedProductLine}
                  onChange={(e) => setSelectedProductLine(e.target.value)}
                >
                  <option value="">Pilih Produk</option>
                  {productLines.map((line) => (
                    <option key={line} value={line}>
                      {line}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Type Dropdown (new) */}
              <div className="input-group">
                <label>Pilih Tipe</label>
                <select
                  value={selectedProductType}
                  onChange={(e) => setSelectedProductType(e.target.value)}
                  disabled={!selectedProductLine}
                >
                  <option value="">Pilih Tipe</option>
                  {getProductTypesForProductLine().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Dropdown */}
              <div className="input-group">
                <label>Pilih Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={!selectedProductType}
                >
                  <option value="">Pilih Kategori</option>
                  {getCategoriesForProductType().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model Dropdown */}
              <div className="input-group">
                <label>Pilih Model</label>
                <select
                  value={selectedModel ? selectedModel.id : ""}
                  onChange={(e) => {
                    const model = getModelsForCategory().find(
                      (m) => m.id === e.target.value
                    );
                    setSelectedModel(model);
                  }}
                  disabled={!selectedCategory}
                >
                  <option value="">Pilih Model</option>
                  {getModelsForCategory().map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - Rp {Number(model.price).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description Display */}
            {selectedModel && selectedModel.description && (
              <div className="description-box">
                <p><strong>Deskripsi:</strong> {selectedModel.description}</p>
              </div>
            )}

            {/* Tambah Produk Button */}
            {selectedModel && (
              <div className="input-group">
                <button onClick={addItem} className="add-button">
                  Tambah Produk
                </button>
              </div>
            )}
          </div>

          {/* Cost & Shipping Section */}
          <div className="cost-column">
            <h3>Biaya & Pengiriman</h3>
            <div className="configurator-grid">
              {/* Cost Inputs */}
              <div className="input-group">
                <label>Biaya Tenaga Kerja (Rp):</label>
                <input
                  type="number"
                  value={laborCost}
                  onChange={(e) => setLaborCost(e.target.value)}
                  placeholder="Masukkan biaya tenaga kerja"
                />
              </div>

              <div className="input-group">
                <label>Biaya Sewa (Rp):</label>
                <input
                  type="number"
                  value={rentCost}
                  onChange={(e) => setRentCost(e.target.value)}
                  placeholder="Masukkan biaya sewa"
                />
              </div>

              <div className="input-group">
                <label>Margin Keuntungan (%):</label>
                <input
                  type="number"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(e.target.value)}
                  placeholder="Masukkan persentase keuntungan"
                />
              </div>

              {/* Shipping Province Dropdown */}
              <div className="input-group">
                <label>Pilih Provinsi</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                >
                  <option value="">Pilih Provinsi</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shipping City Dropdown */}
              <div className="input-group">
                <label>Pilih Kota</label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    const selectedCityName = e.target.value;
                    setSelectedCity(selectedCityName);

                    // Calculate and set shipping cost when city is selected
                    if (selectedCityName) {
                      const cityObj =
                        getCitiesForProvince().find(
                          (c) => c.name === selectedCityName
                        ) || {};
                      const cost = calculateShippingCost(cityObj);
                      setShippingCost(cost);
                    } else {
                      setShippingCost(0);
                    }
                  }}
                  disabled={!selectedProvince}
                >
                  <option value="">Pilih Kota</option>
                  {getCitiesForProvince().map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products List Section - Spans both columns */}
          {items.length > 0 && (
            <div className="table-container">
              <h3>Daftar Produk</h3>
              <table>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Harga (Rp)</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>Rp {Number(item.price).toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => removeItem(index)}
                          className="remove-button"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Main content padding to ensure content isn't hidden behind the sticky footer */}
          <div style={{ paddingBottom: "230px" }}>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Results Section that's always visible */}
      <div id="stickyResults" className="sticky-results">
        <div className="results-grid">
          <div className="result-item">
            <div className="result-label">HPP:</div>
            <div className="result-value">Rp {totalHPP.toLocaleString()}</div>
          </div>
          <div className="result-item">
            <div className="result-label">Biaya Pengiriman:</div>
            <div className="result-value">
              Rp {shippingCost.toLocaleString()}
            </div>
          </div>
          <div className="result-item result-highlight">
            <div className="result-label">Harga Jual:</div>
            <div className="result-value">
              Rp {sellingPrice.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calculator;