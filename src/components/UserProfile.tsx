import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

interface UserProfileProps {
  name: string;
  email: string;
  avatarUrl?: string;
  product?: string;
}

const UserProfile: React.FC = () => {
  const { userId } = useAuth(); // Hämta userId från AuthContext
  const [userInfo, setUserInfo] = useState<UserProfileProps | null>(null);
  const { theme, toggleTheme } = useTheme();
  const [customAvatar, setCustomAvatar] = useState<string | null>(
    localStorage.getItem("customUserAvatar") || null
  );

  // Dynamisk fallback-avatar med första bokstaven i userId
  const fallbackAvatar = userId
    ?  "/User1.png"
    :  "/User1.png";

  useEffect(() => {
    const token = localStorage.getItem(
      "spotifyAccessToken_" + localStorage.getItem("currentUserId")
    );

    if (token) {
      fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setUserInfo({
            name: data.display_name || "Anonym",
            email: data.email || "example@example.com",
            avatarUrl: data.images?.[0]?.url || fallbackAvatar,
            product: data.product || "Free",
          });
        })
        .catch((error) => {
          console.error("Kunde inte hämta användarinformation:", error);
        });
    } else {
      console.error("Ingen token hittades.");
    }
  }, [fallbackAvatar]); 

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64Image = reader.result as string;
        setCustomAvatar(base64Image);
        localStorage.setItem("customUserAvatar", base64Image);
      };

      reader.readAsDataURL(file);
    }
  };

  if (!userInfo) {
    return (
      <div className="user-profile">
        <img
          src={fallbackAvatar}
          alt="Default Profile"
          className="user-avatar"
        />
        <h2 className="user-name">Anonym användare</h2>
        <p className="user-product">Ingen prenumeration</p>
        <p className="user-email">Ingen e-post tillgänglig</p>
      </div>
    );
  }

  return (
    <div className="user-profile" style={{ position: "relative" }}>
      <img
        src={customAvatar || userInfo.avatarUrl || fallbackAvatar}
        alt="Profile"
        className="user-avatar"
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallbackAvatar;
        }}
      />
      <h2 className="user-name">{userInfo.name}</h2>
      <p className="user-product" id="user-product">
        {userInfo.product === "premium" ? "Spotify Premium ⭐️" : "Spotify Free"}
      </p>
      <p className="user-email">{userInfo.email}</p>
      {userInfo.name !== "Anonym" && (
        <input
          id="upload-avatar"
          type="file"
          accept="image/*"
          className="upload-input"
          onChange={handleImageUpload}
          style={{ color: "black" }}
        />
      )}
      <button
        className="theme-switch-btn"
        onClick={() => {
          toggleTheme();
        }}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
    </div>
  );
};

export default UserProfile;
