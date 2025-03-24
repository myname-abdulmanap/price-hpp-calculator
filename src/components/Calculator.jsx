import { useState, useEffect } from "react";
import ThemeToggle from "./DarkMode";

function Calculator() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: 0 });
  const [laborCost, setLaborCost] = useState(0);
  const [rentCost, setRentCost] = useState(0);
  const [profitMargin, setProfitMargin] = useState(15);
  const [darkMode, setDarkMode] = useState(false);

  // Check system preference on initial load
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    // Listen for changes to system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme class to document body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Tambah item bahan baku
  const addItem = () => {
    if (newItem.name && newItem.price > 0) {
      setItems([...items, newItem]);
      setNewItem({ name: "", price: 0 });
    }
  };

  // Hitung total modal produksi (HPP)
  const totalMaterialCost = items.reduce((acc, item) => acc + Number(item.price), 0);
  const totalHPP = totalMaterialCost + Number(laborCost) + Number(rentCost);

  // Hitung harga jual
  const sellingPrice = totalHPP + (totalHPP * (profitMargin / 100));

  return (
    <div className={`container ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

      <h2>Kalkulator HPP</h2>

      {/* Input bahan baku */}
      <div className="input-group">
        <label>Nama Bahan Baku</label>
        <input
          type="text"
          placeholder="Nama Bahan"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <br />
        <br />
        
        <label>Harga Bahan Baku</label>
        
        <input
          type="number"
          placeholder="Harga (Rp)"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        />
    
        <button onClick={addItem} className="add-button">
          Tambah
        </button>
      </div>

      

      {/* Tabel daftar bahan */}
      {items.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Bahan</th>
                <th>Harga (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>Rp {Number(item.price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Input Biaya Lainnya */}
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
        <h3>Total HPP: <span className="amount">Rp {totalHPP.toLocaleString()}</span></h3>
        <h3>Harga Jual: <span className="amount">Rp {sellingPrice.toLocaleString()}</span></h3>
      </div>
    </div>
  );
}

export default Calculator;