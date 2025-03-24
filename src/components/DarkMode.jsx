
import { Sun, Moon } from "lucide-react";

// Theme context could be used in a larger app, but for simplicity we'll use props
const ThemeToggle = ({ darkMode, setDarkMode }) => {
  // Toggle theme when button is clicked
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="theme-toggle">
      <button 
        onClick={toggleTheme} 
        className="theme-button"
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  );
};

export default ThemeToggle;