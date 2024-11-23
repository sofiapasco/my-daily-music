import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();

  useEffect(() => {
    const extractToken = () => {
      const hash = window.location.hash;
      console.log("URL Hash before extraction:", hash);

      // Hantera endast om hash innehåller "access_token"
      if (hash.includes("access_token")) {
        const token = new URLSearchParams(hash.substring(1)).get("access_token");
        console.log("Extracted Token:", token);

        if (token) {
          setAccessToken(token);
          localStorage.setItem("spotifyAccessToken", token);

          // Navigera till nästa sida
          navigate("/daily-song");
        } else {
          console.error("Token kunde inte extraheras.");
          navigate("/");
        }

        // Rensa hash efter att det hanterats
        window.location.hash = "";
      } else {
        console.log("Ingen token hittades i hash.");
      }
    };

    extractToken();
  }, [navigate, setAccessToken]);

  return <div>Laddar...</div>;
};

export default Callback;
