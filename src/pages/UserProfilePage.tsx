import React from "react";
import UserProfile from "../components/UserProfile";
import UserMenu from "../components/UserMenu";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const UserPage: React.FC = () => {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();


    const handleLogout = () => {
        localStorage.removeItem("spotifyAccessToken");
        logout();
      };
    
  return (
    <div className="user-page-container">
      <div className="header">
      <button
        className="theme-switch-btn"
        onClick={() => {
          toggleTheme(); 
          console.log("Tema efter växling:", theme === "light" ? "dark" : "light"); // Kontrollera nästa tema
        }}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
        <UserMenu />
        <button className="logout-btn" onClick={handleLogout}>
          Logga ut
        </button>
      </div>
      <div className="user-page">
        <UserProfile />
      </div>
    </div>
  );
};

export default UserPage;
