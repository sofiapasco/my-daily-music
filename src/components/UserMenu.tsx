import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const UserMenu: React.FC = () => {
  const { userInfo } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const fallbackAvatar =  "/User1.png";

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
          boxShadow: "none",
        }}
      >
        {/* Profilbild */}
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
          }}
        >
          {userInfo?.avatarUrl ? (
            <img
              src={userInfo.avatarUrl}
              alt="User Avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = fallbackAvatar;
              }}
            />
          ) : (
            <span style={{ color: "white", fontSize: "20px" }}>
              {userInfo?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown-menyn */}
      {isDropdownOpen && (
        <div
          className="user-dropdown"
        >
          <a href="/profile" style={{ display: "block", padding: "10px" }}>
            Profil
          </a>
          <a href="/daily-song" style={{ display: "block", padding: "10px" }}>
            Dagens låt
          </a>
          <a href="/saved-songs" style={{ display: "block", padding: "10px" }}>
            Sparade låtar
          </a>
          <a href="/statistics" style={{ display: "block", padding: "10px" }}>
            Statistik
          </a>
          <a href="/music-diary" style={{ display: "block", padding: "10px" }}>
            Musikdagbok
          </a>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
