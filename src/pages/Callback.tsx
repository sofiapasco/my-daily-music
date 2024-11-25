import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth(); // Förväntar sig token och userId
  const [tokenHandled, setTokenHandled] = React.useState(false);

  useEffect(() => {
    const extractToken = async () => {
      if (tokenHandled) return; // Undvik att hantera token flera gånger

      const hash = window.location.hash;
      console.log("URL Hash before extraction:", hash);

      if (hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get("access_token");
        const expiresIn = parseInt(params.get("expires_in") || "3600", 10);

        if (token) {
          console.log("Extracted Token:", token);

          // Hämta användar-ID från Spotify
          const response = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const userData = await response.json();
            const userId = userData.id; // Hämta användar-ID
            console.log("User ID:", userId);

            // Spara token och användar-ID via AuthContext
            setAccessToken(token, userId);

            // Spara till localStorage för framtida sessioner
            localStorage.setItem(`spotifyAccessToken_${userId}`, token);
            localStorage.setItem("currentUserId", userId);
            localStorage.setItem("spotifyTokenExpiry", (Date.now() + expiresIn * 1000).toString());
            setTokenHandled(true);

            // Navigera till nästa sida
            navigate("/daily-song");
          } else {
            console.error("Kunde inte hämta användar-ID.");
            navigate("/");
          }

          window.location.hash = ""; // Rensa hash
        } else {
          console.error("Token kunde inte extraheras.");
          navigate("/");
        }
      } else {
        console.error("Ingen token hittades i hash.");
        navigate("/");
      }
    };

    extractToken();
  }, [navigate, setAccessToken, tokenHandled]);

  return <span className="loader"></span>;
};

export default Callback;

