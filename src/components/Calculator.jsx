import React, { useState, useEffect } from "react";
import ThemeToggle from "./DarkMode";

// Import JSON data
import ProNoteData from '../data/ProNote.json';
import BPSData from '../data/BPS.json';
import CompassData from '../data/CompassAssetManager.json';
import IndonesiaCities from '../data/IndonesiaCities.json';

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
  
  // New state for shipping
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [shippingCost, setShippingCost] = useState(0);

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
    switch(selectedProductLine) {
      case 'ProNote':
        return ['Models', 'ExternalDisplays', 'Printers', 'AdditionalOptions'];
      case 'BPS':
        return Object.keys(BPSData.BPS);
      case 'CompassAssetManager':
        return ['Subscriptions'];
      default:
        return [];
    }
  };

  // Get models for selected category
  const getModelsForCategory = () => {
    if (!selectedProductLine || !selectedCategory) return [];

    switch(selectedProductLine) {
      case 'ProNote':
        return ProNoteData.ProNote[selectedCategory] || [];
      case 'BPS':
        return BPSData.BPS[selectedCategory]?.Models || [];
      case 'CompassAssetManager':
        return CompassData.CompassAssetManager[selectedCategory] || [];
      default:
        return [];
    }
  };

  // Add item to list
  const addItem = () => {
    if (selectedModel) {
      // Check if the model is already in the list
      const isModelAlreadyAdded = items.some(item => item.id === selectedModel.id);
      
      if (!isModelAlreadyAdded) {
        setItems([...items, {
          ...selectedModel,
          // Use the original model price directly
          price: selectedModel.price
        }]);
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
  const totalMaterialCost = items.reduce((acc, item) => acc + Number(item.price), 0);
  const totalHPP = totalMaterialCost + Number(laborCost) + Number(rentCost);
  const sellingPrice = totalHPP + totalHPP * (profitMargin / 100) + Number(shippingCost);

  // Get provinces 
  const provinces = Object.keys(IndonesiaCities);

  // Get cities for selected province
  const getCitiesForProvince = () => {
    return selectedProvince ? IndonesiaCities[selectedProvince] : [];
  };

  // Calculate shipping cost (example logic, you can customize)
  const calculateShippingCost = (city) => {
    const baseRate = 50000; // Base shipping rate
    const distanceMultiplier = {
      'Jabodetabek': 1,
      'Jawa': 1.5,
      'Luar Jawa': 2.5
    };

    // Example shipping cost calculation based on region
    const region = city.region || 'Luar Jawa';
    return Math.round(baseRate * distanceMultiplier[region]);
  };

  return (
    <div className={`container ${darkMode ? "dark-theme" : "light-theme"}`}>
      <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

      <h2>Configurator</h2>

      {/* Product Line Dropdown */}
      <div className="input-group">
        <label>Pilih Produk / Mesin</label>
        <select 
          value={selectedProductLine} 
          onChange={(e) => setSelectedProductLine(e.target.value)}
        >
          <option value="">Pilih Produk</option>
          {productLines.map(line => (
            <option key={line} value={line}>{line}</option>
          ))}
        </select>
      </div>

      {/* Category Dropdown */}
      {selectedProductLine && (
        <div className="input-group">
          <label>Pilih Kategori</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Pilih Kategori</option>
            {getCategoriesForProductLine().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      )}

      {/* Model Dropdown */}
      {selectedCategory && (
        <div className="input-group">
          <label>Pilih Model</label>
          <select 
            value={selectedModel ? selectedModel.id : ""}
            onChange={(e) => {
              const model = getModelsForCategory().find(m => m.id === e.target.value);
              setSelectedModel(model);
            }}
          >
            <option value="">Pilih Model</option>
            {getModelsForCategory().map(model => (
              <option key={model.id} value={model.id}>
                {model.name} - Rp {model.price.toLocaleString()}
              </option>
            ))}
          </select>
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

      {/* Daftar Item */}
      {items.length > 0 && (
        <div className="table-container">
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
                    <button onClick={() => removeItem(index)} className="remove-button">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Shipping Location Dropdowns */}
      <div className="input-group">
        <label>Pilih Provinsi</label>
        <select 
          value={selectedProvince} 
          onChange={(e) => setSelectedProvince(e.target.value)}
        >
          <option value="">Pilih Provinsi</option>
          {provinces.map(province => (
            <option key={province} value={province}>{province}</option>
          ))}
        </select>
      </div>

      {selectedProvince && (
        <div className="input-group">
          <label>Pilih Kota</label>
          <select 
            value={selectedCity}
            onChange={(e) => {
              const selectedCityName = e.target.value;
              setSelectedCity(selectedCityName);
              
              // Calculate and set shipping cost when city is selected
              const cost = calculateShippingCost(
                getCitiesForProvince().find(c => c.name === selectedCityName) || {}
              );
              setShippingCost(cost);
            }}
          >
            <option value="">Pilih Kota</option>
            {getCitiesForProvince().map(city => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Biaya Tambahan */}
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

      {/* Hasil Perhitungan */}
      <div className="results">
        <h3>
          Total Harga Produk: <span className="amount">Rp {totalMaterialCost.toLocaleString()}</span>
        </h3>
        <h3>
          Total HPP: <span className="amount">Rp {totalHPP.toLocaleString()}</span>
        </h3>
        <h3>
          Biaya Pengiriman: <span className="amount">Rp {shippingCost.toLocaleString()}</span>
        </h3>
        <h3>
          Harga Jual: <span className="amount">Rp {sellingPrice.toLocaleString()}</span>
        </h3>
      </div>
    </div>
  );
}

export default Calculator;