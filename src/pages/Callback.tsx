import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const [userInfo, setUserInfo] = useState<{ email?: string; displayName?: string } | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const token = new URLSearchParams(hash.substring(1)).get("access_token");

    if (token) {
      setAccessToken(token);
      localStorage.setItem("spotifyAccessToken", token);

      // Hämta användarens information från Spotify API
      fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch user profile: ${response.status}`);
          }
          return response.json();
        })
        .then((userData) => {
          console.log("Token scopes:", userData.scopes); 
          setUserInfo({
            email: userData.email,
            displayName: userData.display_name,
          });

          const today = new Date();
          const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
          const storedSong = localStorage.getItem(`dailySong_${dateKey}`);

          if (storedSong) {
            navigate("/daily-song");
          } else {
            navigate("/daily-song");
          }
        })
        .catch((error) => {
          console.error("Ett fel uppstod vid hämtning av användarprofil:", error);
          navigate("/error");
        });
    } else {
      console.error("Ingen access token hittades i URL:en.");
      navigate("/error");
    }

    window.location.hash = ""; // Rensa hash från URL:en
  }, [navigate, setAccessToken]);

  return (
    <div>
      <span className="loader"></span>
    </div>
  );
};

export default Callback;
