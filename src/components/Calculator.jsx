import React, { useState, useEffect } from "react";
import ThemeToggle from "./DarkMode";
import bcrypt from "bcryptjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Import JSON data
import ProNoteData from "../data/ProNote.json";
import BPSData from "../data/BPS.json";
import CompassData from "../data/CompassAssetManager.json";
import IndonesiaCities from "../data/IndonesiaCities.json";

function Calculator() {
  const [selectedProductLine, setSelectedProductLine] = useState("");
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
    setSelectedCategory("");
    setSelectedModel(null);
  }, [selectedProductLine]);

  // Reset model when category changes
  useEffect(() => {
    setSelectedModel(null);
  }, [selectedCategory]);

  // Reset city when province changes
  useEffect(() => {
    setSelectedCity("");
    setShippingCost(0);
  }, [selectedProvince]);

  // Product line dropdown options
  const productLines = Object.keys(ProNoteData).concat(
    Object.keys(BPSData),
    Object.keys(CompassData)
  );

  // Get categories for selected product line
  const getCategoriesForProductLine = () => {
    switch (selectedProductLine) {
      case "ProNote":
        return ["Models", "ExternalDisplays", "Printers", "AdditionalOptions"];
      case "BPS":
        return Object.keys(BPSData.BPS);
      case "CompassAssetManager":
        return ["Subscriptions"];
      default:
        return [];
    }
  };

  // Get models for selected category
  const getModelsForCategory = () => {
    if (!selectedProductLine || !selectedCategory) return [];

    switch (selectedProductLine) {
      case "ProNote":
        return ProNoteData.ProNote[selectedCategory] || [];
      case "BPS":
        return BPSData.BPS[selectedCategory]?.Models || [];
      case "CompassAssetManager":
        return CompassData.CompassAssetManager[selectedCategory] || [];
      default:
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
      // didDrawPage: function (data) {
      //   // Kosongkan atau hapus bagian ini dulu
      // }
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

              {/* Category Dropdown */}
              <div className="input-group">
                <label>Pilih Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={!selectedProductLine}
                >
                  <option value="">Pilih Kategori</option>
                  {getCategoriesForProductLine().map((category) => (
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
                      {model.name} - Rp {model.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Description Section - Added new section */}
            {selectedModel && selectedModel.description && (
              <div className="description-container">
                <h4>Deskripsi Produk</h4>
                <p>{selectedModel.description}</p>
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
                    <th>Deskripsi</th>
                    <th>Harga (Rp)</th>
                    <th>Aksi</th>
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
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Export Buttons - Added below table */}
              <div className="export-buttons">
                <button
                  onClick={exportToPDF}
                  className="export-button pdf-button"
                >
                  <span className="button-icon">📄</span> Export ke PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="export-button excel-button"
                >
                  <span className="button-icon">📊</span> Export ke Excel
                </button>
              </div>
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
