import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const UserMenu: React.FC = () => {
  const { userInfo } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const fallbackAvatar = `https://via.placeholder.com/150/922692/FFFFFF?text=${userInfo?.name?.charAt(0).toUpperCase()}`;


  return (
    <div className="profile-menu" style={{ position: "relative", display: "inline-block" }}>
      <button
        className="user-button"
        onClick={toggleDropdown}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          outline: "none",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "none",
            overflow: "hidden",
            outline: "none",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
          }}
        >
          <img
            src={userInfo?.avatarUrl || fallbackAvatar}
            alt="User Avatar"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackAvatar;
            }}
          />
        </div>
      </button>

      {/* Dropdown-menyn */}
      {isDropdownOpen && (
        <div className="user-dropdown" style={{ position: "absolute", top: "100%", right:" 30px", }}>
          <a href="/profile" style={{ display: "block", padding: "10px" }}>
            Profil
          </a>
          <a href="/daily-song" style={{ display: "block", padding: "10px" }}>
            Dagens låt
          </a>
          <a href="/saved-songs" style={{ display: "block", padding: "10px" }}>
            Sparade låtar
          </a>
          <a href="/music-diary" style={{ display: "block", padding: "10px" }}>
            Musikdagbok
          </a>
          <a href="/statistics" style={{ display: "block", padding: "10px" }}>
            Statistik
          </a>
        </div>
      )}
    </div>
  );
};

export default UserMenu;