import React, { useEffect, useState } from "react";

interface UserProfileProps {
  name: string;
  email: string;
  avatarUrl?: string;
  product?: string;
}

const UserProfile: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserProfileProps | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(
    localStorage.getItem("customUserAvatar") || null
  );

  useEffect(() => {
    // Hämta token och användar-ID från localStorage
    const token = localStorage.getItem("spotifyAccessToken_" + localStorage.getItem("currentUserId"));

    if (token) {
      // Anropa Spotify API för att hämta användarinformation
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
            avatarUrl: data.images?.[0]?.url || "/default-avatar.png",
            product: data.product || "Free",
          });
        })
        .catch((error) => {
          console.error("Kunde inte hämta användarinformation:", error);
        });
    } else {
      console.error("Ingen token hittades.");
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      // Sätt ny avatar och spara i localStorage
      setCustomAvatar(imageUrl);
      localStorage.setItem("customUserAvatar", imageUrl);
    }
  };

  if (!userInfo) {
    return <p>Loading user info...</p>;
  }

  return (
    <div className="user-profile">
      <img
        src={customAvatar || userInfo.avatarUrl}
        alt="Profile"
        className="user-avatar"
      />
      <h2 className="user-name">{userInfo.name}</h2>
      <p className="user-email">{userInfo.email}</p>
      <p className="user-product">
        {userInfo.product === "premium" ? "Spotify Premium" : "Spotify Free"}
      </p>
      <input
        id="upload-avatar"
        type="file"
        accept="image/*"
        className="upload-input"
        onChange={handleImageUpload}
        style={{color:"black"}}
      />
    </div>
  );
};

export default UserProfile;
