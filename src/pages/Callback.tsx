import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setAccessToken } from "../service/spotify";

const Callback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Hämta token från URL-hashen
    const hash = window.location.hash;
    const token = new URLSearchParams(hash.substring(1)).get("access_token");

    if (token) {
      // Spara token lokalt och sätt den i Spotify-klienten
      setAccessToken(token);
      localStorage.setItem("spotifyAccessToken", token);

      // Navigera till nästa sida (t.ex. "dagens låt")
      navigate("/daily-song");
    } else {
      console.error("Ingen access-token hittades");
    }
  }, [navigate]);

  return <div>Loggar in...</div>;
};

export default Callback;
