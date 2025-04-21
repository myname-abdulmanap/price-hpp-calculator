import React, { useState, useEffect } from "react";
import ThemeToggle from "./DarkMode";
import bcrypt from "bcryptjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Import JSON data
import ProNoteData from "../data/ProNote.json";
import BPSC1Data from "../data/BPS.json";
import BPSC2Data from "../data/BPSC2.json";
import BPSC5Data from "../data/BPSC5.json";
import BPSC6Data from "../data/BPSC6.json";
import CompassData from "../data/CompassAssetManager.json";
import IndonesiaCities from "../data/IndonesiaCities.json";

function Calculator() {
  const [selectedProductLine, setSelectedProductLine] = useState("");
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedAdditionalCategory, setSelectedAdditionalCategory] =
    useState("");
  const [selectedAdditionalType, setSelectedAdditionalType] = useState(""); // New state for additional type
  const [selectedAdditionalItem, setSelectedAdditionalItem] = useState(null);
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
    setSelectedModel(null);
    setSelectedAdditionalCategory("");
    setSelectedAdditionalType(""); // Reset type as well
    setSelectedAdditionalItem(null);
  }, [selectedProductLine]);

  // Reset additional type and item when additional category changes
  useEffect(() => {
    setSelectedAdditionalType("");
    setSelectedAdditionalItem(null);
  }, [selectedAdditionalCategory]);

  // Reset additional item when additional type changes
  useEffect(() => {
    setSelectedAdditionalItem(null);
  }, [selectedAdditionalType]);

  // Reset city when province changes
  useEffect(() => {
    setSelectedCity("");
    setShippingCost(0);
  }, [selectedProvince]);

  // Product line dropdown options
  const productLines = Object.keys(ProNoteData).concat(
    Object.keys(BPSC1Data),
    Object.keys(BPSC2Data),
    Object.keys(BPSC5Data),
    Object.keys(BPSC6Data),
    Object.keys(CompassData)
  );

  // Get all models for selected product line
  const getModelsForProductLine = () => {
    switch (selectedProductLine) {
      case "ProNote":
        return ProNoteData.ProNote.Models || [];
      case "BPSC1":
        return BPSC1Data.BPSC1.Models || [];
      case "BPSC2":
        return BPSC2Data.BPSC2.Models || [];
      case "BPSC5":
        return BPSC5Data.BPSC5.Models || [];
      case "BPSC6":
        return BPSC6Data.BPSC6.Models || [];

      case "CompassAssetManager":
        // Assuming Compass models are in Subscriptions
        return CompassData.CompassAssetManager.Subscriptions || [];
      default:
        return [];
    }
  };

  // Get additional categories for selected product line
  const getAdditionalCategories = () => {
    switch (selectedProductLine) {
      case "ProNote":
        return ["Hardware Options"];
    
      case "BPSC1":
        return ["Hardware Options", "Currency Adaptation", "Software Options", "Service"];

      case "BPSC2":
        return ["Hardware Options", "Currency Adaptation", "Software Options"];
      case "BPSC5":
        return ["Hardware Options", "Service", "Software Options"];
     
      case "BPSC6":
        return ["Hardware Options", "Service", "Software Options"];
     
      case "CompassAssetManager":
        return ["-"];
      default:
        return [];
    }
  };

  // Get additional types for selected category
  const getAdditionalTypesForCategory = () => {
    if (!selectedProductLine || !selectedAdditionalCategory) return [];

    // Access the appropriate data source based on product line
    let data;
    switch (selectedProductLine) {
      case "ProNote":
        data = ProNoteData.ProNote;
        break;

      case "BPSC1":
        data = BPSC1Data.BPSC1;
        break;

        case "BPSC2":
          data = BPSC2Data.BPSC2;
          break;
        case "BPSC5":
          data = BPSC5Data.BPSC5;
          break;
        case "BPSC6":
          data = BPSC6Data.BPSC6;
          break;


      case "CompassAssetManager":
        data = CompassData.CompassAssetManager;
        break;
      default:
        return [];
    }

    // Get the category data
    const categoryData = data[selectedAdditionalCategory];

    if (!categoryData) return [];

    // If the category data is an object (not an array), return its keys as types
    if (typeof categoryData === "object" && !Array.isArray(categoryData)) {
      return Object.keys(categoryData);
    }

    return [];
  };

  // Get additional items for selected type
  const getAdditionalItemsForType = () => {
    if (
      !selectedProductLine ||
      !selectedAdditionalCategory ||
      !selectedAdditionalType
    )
      return [];

    // Access the appropriate data source based on product line
    let data;
    switch (selectedProductLine) {
      case "ProNote":
        data = ProNoteData.ProNote;
        break;
      case "BPSC1":
        data = BPSC1Data.BPSC1;
        break;
      case "BPSC2":
        data = BPSC2Data.BPSC2;
        break;
      case "BPSC5":
        data = BPSC5Data.BPSC5;
        break;
      case "BPSC6":
        data = BPSC6Data.BPSC6;
        break;
      case "CompassAssetManager":
        data = CompassData.CompassAssetManager;
        break;
      default:
        return [];
    }

    // Try to get items from the nested type within the category
    const categoryData = data[selectedAdditionalCategory];
    if (!categoryData) return [];

    const typeItems = categoryData[selectedAdditionalType];
    return Array.isArray(typeItems) ? typeItems : [];
  };

  // Add model to list
  const addModel = () => {
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

  // Add additional item to list
  const addAdditionalItem = () => {
    if (selectedAdditionalItem) {
      // Check if the additional item is already in the list
      const isItemAlreadyAdded = items.some(
        (item) => item.id === selectedAdditionalItem.id
      );

      if (!isItemAlreadyAdded) {
        setItems([
          ...items,
          {
            ...selectedAdditionalItem,
            price: selectedAdditionalItem.price,
          },
        ]);
      } else {
        alert("Item ini sudah ditambahkan sebelumnya.");
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
    totalHPP / (1 - profitMargin / 100) + Number(shippingCost);

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

  // Export to PDF function
  const exportToPDF = () => {
    // Create new PDF document
    const doc = new jsPDF();

    // Add title with proper font settings
    doc.setFontSize(18);
    doc.text("Ringkasan Konfigurasi Produk", 14, 22);

    // Add date
    const today = new Date();
    doc.setFontSize(10);
    doc.text(`Tanggal: ${today.toLocaleDateString("id-ID")}`, 14, 30);

    // Format the data for table
    const tableData = items.map((item) => [
      item.name,
      item.description || "-",
      `Rp ${Number(item.price).toLocaleString("id-ID")}`,
    ]);

    // Add product table
    autoTable(doc, {
      head: [["Nama", "Deskripsi", "Harga (Rp)"]],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 66, 66],
      },
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Calculate last Y position
    const finalY = doc.lastAutoTable.finalY + 20;

    // Add summary information
    doc.setFontSize(12);
    doc.text("Ringkasan Biaya:", 14, finalY);
    doc.setFontSize(10);

    // Use a consistent spacing value
    const lineSpacing = 8;
    let currentY = finalY + 10;

    // Add each summary line with proper formatting
    doc.text(
      `Total Biaya Material: Rp ${totalMaterialCost.toLocaleString("id-ID")}`,
      14,
      currentY
    );
    currentY += lineSpacing;

    doc.text(
      `Biaya Tenaga Kerja: Rp ${Number(laborCost).toLocaleString("id-ID")}`,
      14,
      currentY
    );
    currentY += lineSpacing;

    doc.text(
      `Biaya Sewa: Rp ${Number(rentCost).toLocaleString("id-ID")}`,
      14,
      currentY
    );
    currentY += lineSpacing;

    doc.text(`HPP: Rp ${totalHPP.toLocaleString("id-ID")}`, 14, currentY);
    currentY += lineSpacing;

    doc.text(`Margin Keuntungan: ${profitMargin}%`, 14, currentY);
    currentY += lineSpacing;

    doc.text(
      `Biaya Pengiriman: Rp ${shippingCost.toLocaleString("id-ID")}`,
      14,
      currentY
    );
    currentY += lineSpacing * 1.5;

    // Add selling price with highlight
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Harga Jual: Rp ${sellingPrice.toLocaleString("id-ID")}`,
      14,
      currentY
    );
    currentY += lineSpacing * 2;

    // Add shipping information if available
    if (selectedProvince && selectedCity) {
      doc.setFontSize(12);
      doc.text("Informasi Pengiriman:", 14, currentY);
      currentY += lineSpacing;

      doc.setFontSize(10);
      doc.text(`Provinsi: ${selectedProvince}`, 14, currentY);
      currentY += lineSpacing;

      doc.text(`Kota: ${selectedCity}`, 14, currentY);
    }

    // Save the PDF
    doc.save("konfigurasi-produk.pdf");
  };

  // Export to Excel function
  const exportToExcel = () => {
    // Prepare data for products
    const productData = items.map((item) => ({
      Nama: item.name,
      Deskripsi: item.description || "-",
      "Harga (Rp)": Number(item.price),
    }));

    // Prepare summary data
    const summaryData = [
      { "Ringkasan Biaya": "Total Biaya Material", Nilai: totalMaterialCost },
      { "Ringkasan Biaya": "Biaya Tenaga Kerja", Nilai: Number(laborCost) },
      { "Ringkasan Biaya": "Biaya Sewa", Nilai: Number(rentCost) },
      { "Ringkasan Biaya": "HPP", Nilai: totalHPP },
      {
        "Ringkasan Biaya": "Margin Keuntungan (%)",
        Nilai: Number(profitMargin),
      },
      { "Ringkasan Biaya": "Biaya Pengiriman", Nilai: shippingCost },
      { "Ringkasan Biaya": "Harga Jual", Nilai: sellingPrice },
    ];

    // Create a workbook with multiple sheets
    const wb = XLSX.utils.book_new();

    // Add products sheet
    const wsProducts = XLSX.utils.json_to_sheet(productData);
    XLSX.utils.book_append_sheet(wb, wsProducts, "Daftar Produk");

    // Add summary sheet
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Biaya");

    // Save the Excel file
    XLSX.writeFile(wb, "konfigurasi-produk.xlsx");
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
            <h3>System</h3>
            <div className="configurator-grid">
              {/* Product Line Dropdown */}
              <div className="input-group">
                <label>Machine</label>
                <select
                  value={selectedProductLine}
                  onChange={(e) => setSelectedProductLine(e.target.value)}
                >
                  <option value="">Machine Type</option>
                  {productLines.map((line) => (
                    <option key={line} value={line}>
                      {line}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model Dropdown - Direct from product line */}
              <div className="input-group">
                <label>Model</label>
                <select
                  value={selectedModel ? selectedModel.id : ""}
                  onChange={(e) => {
                    const model = getModelsForProductLine().find(
                      (m) => m.id === e.target.value
                    );
                    setSelectedModel(model);
                  }}
                  disabled={!selectedProductLine}
                >
                  <option value="">Choose Model</option>
                  {getModelsForProductLine().map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - Rp {model.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Category Dropdown */}
              <div className="input-group">
                <label>Additional Options</label>
                <select
                  value={selectedAdditionalCategory}
                  onChange={(e) =>
                    setSelectedAdditionalCategory(e.target.value)
                  }
                  disabled={!selectedProductLine}
                >
                  <option value="">Select Additional Category</option>
                  {getAdditionalCategories().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Type Dropdown - NEW DROPDOWN */}
              <div className="input-group">
                <label>Additional Type</label>
                <select
                  value={selectedAdditionalType}
                  onChange={(e) => setSelectedAdditionalType(e.target.value)}
                  disabled={!selectedAdditionalCategory}
                >
                  <option value="">Select Type</option>
                  {getAdditionalTypesForCategory().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Item Dropdown - Now dependent on Type */}
              <div className="input-group">
                <label>Additional Item</label>
                <select
                  value={
                    selectedAdditionalItem ? selectedAdditionalItem.id : ""
                  }
                  onChange={(e) => {
                    const item = getAdditionalItemsForType().find(
                      (i) => i.id === e.target.value
                    );
                    setSelectedAdditionalItem(item);
                  }}
                  disabled={!selectedAdditionalType}
                >
                  <option value="">Choose Item</option>
                  {getAdditionalItemsForType().map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - Rp {item.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add Model Button */}
            {selectedModel && (
              <div className="input-group">
                <button onClick={addModel} className="add-button">
                  Add Machine Model
                </button>
              </div>
            )}

            {/* Add Additional Item Button */}
            {selectedAdditionalItem && (
              <div className="input-group">
                <button onClick={addAdditionalItem} className="add-button">
                  Add Additional Item
                </button>
              </div>
            )}

            {/* Product Description Section */}
            {selectedModel && selectedModel.description && (
              <div className="description-container">
                <h4>Model Description</h4>
                <p>{selectedModel.description}</p>
              </div>
            )}

            {selectedAdditionalItem && selectedAdditionalItem.description && (
              <div className="description-container">
                <h4>Additional Item</h4>
                <p>{selectedAdditionalItem.description}</p>
              </div>
            )}
          </div>

          {/* Cost & Shipping Section */}
          <div className="cost-column">
            <h3>Additional Costs</h3>
            <div className="configurator-grid">
              {/* Cost Inputs */}
              <div className="input-group">
                <label>Labor Cost (Rp):</label>
                <input
                  type="number"
                  value={laborCost}
                  onChange={(e) => setLaborCost(e.target.value)}
                  placeholder="Enter labor cost"
                />
              </div>

              <div className="input-group">
                <label>Rental Cost (Rp):</label>
                <input
                  type="number"
                  value={rentCost}
                  onChange={(e) => setRentCost(e.target.value)}
                  placeholder="Enter rental cost"
                />
              </div>

              {/* Shipping Province Dropdown */}
              <div className="input-group">
                <label>Select Province</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                >
                  <option value="">Select Province</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shipping City Dropdown */}
              <div className="input-group">
                <label>Select City</label>
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
                  <option value="">Select City</option>
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
              <h3>Product List</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price (Rp)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.description || "-"}</td>
                      <td>Rp {Number(item.price).toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => removeItem(index)}
                          className="remove-button"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Profit Margin Input - Moved here after product list */}
          <div className="margin-section">
            <h3>Profit Settings</h3>
            <div className="input-group profit-margin-input">
              <label>Profit Margin (%):</label>
              <input
                type="number"
                value={profitMargin}
                onChange={(e) => setProfitMargin(e.target.value)}
                placeholder="Enter profit percentage"
              />
            </div>
          </div>

          {/* Cost Summary Section - Added after profit margin */}
         {/* Cost Summary Section - Enhanced styling */}
<div className="cost-summary-section">
  <h3>Cost Summary</h3>
  <div className="cost-summary-container">
    <div className="cost-summary-grid">
      <div className="summary-item">
        <div className="summary-label">Total Material Cost:</div>
        <div className="summary-value">Rp {totalMaterialCost.toLocaleString()}</div>
      </div>
      <div className="summary-item">
        <div className="summary-label">Labor Cost:</div>
        <div className="summary-value">Rp {Number(laborCost).toLocaleString()}</div>
      </div>
      <div className="summary-item">
        <div className="summary-label">Rental Cost:</div>
        <div className="summary-value">Rp {Number(rentCost).toLocaleString()}</div>
      </div>
      <div className="summary-item highlight">
        <div className="summary-label">COGS (HPP):</div>
        <div className="summary-value">Rp {totalHPP.toLocaleString()}</div>
      </div>
      <div className="summary-item">
        <div className="summary-label">Shipping Cost:</div>
        <div className="summary-value">Rp {shippingCost.toLocaleString()}</div>
      </div>
    </div>

    {/* Export Buttons - Moved below cost summary */}
    {items.length > 0 && (
            <div className="export-buttons">
              <button
                onClick={exportToPDF}
                className="export-button pdf-button"
              >
                <span className="button-icon">📄</span> Export to PDF
              </button>
              <button
                onClick={exportToExcel}
                className="export-button excel-button"
              >
                <span className="button-icon">📊</span> Export to Excel
              </button>
            </div>
          )}

  </div>
</div>

          
          {/* Main content padding to ensure content isn't hidden behind the sticky footer */}
          <div style={{ paddingBottom: "120px" }}>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Results Section that only shows selling price */}
      <div id="stickyResults" className="sticky-results">
        <div className="results-grid">
          <div className="result-item result-highlight">
            <div className="result-label">Selling Price:</div>
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
