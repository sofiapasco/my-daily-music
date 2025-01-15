import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, setDoc } from "firebase/firestore"; // Firestore-funktioner
import { db } from "../service/firebaseConfig"; // Firestore-instans

const saveSpotifyUser = async (accessToken: string) => {
  console.log("Sparar användardata i Firestore...");
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Spotify API-svar misslyckades: ${response.status}`);
    }

    const spotifyUser = await response.json();
    console.log("Spotify användardata:", spotifyUser);

    const userId = spotifyUser.id;
    const displayName = spotifyUser.display_name;
    const email = spotifyUser.email;

    const userDoc = doc(db, "users", userId);
    await setDoc(userDoc, { displayName, email, spotifyId: userId }, { merge: true });

    console.log("Användardata har sparats i Firestore!");
  } catch (error) {
    console.error("Fel vid sparning av användardata:", error);
  }
};

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth(); // Förväntar sig token och userId
  const [tokenHandled, setTokenHandled] = React.useState(false);

  useEffect(() => {
    const extractToken = async () => {

      if (tokenHandled) return; // Undvik att hantera token flera gånger

      const hash = window.location.hash;
      console.log("Full URL Hash:", hash);

      if (hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get("access_token");
        const expiresIn = parseInt(params.get("expires_in") || "3600", 10);
        const scopes = params.get("scope") || [
          "user-read-private",
          "user-read-email",
          "playlist-read-collaborative",
          "user-top-read",
          "user-read-recently-played",
          "user-library-modify",
          "user-library-read",
          "streaming",
          "playlist-read-private",
          "playlist-modify-private",
          "playlist-modify-public",
          "user-read-playback-state",
          "user-modify-playback-state",
        ].join(" ");
        
        console.log("Scopes:", scopes);

          if (scopes) {
            console.log("Scopes:", scopes);

            // Spara scopes i localStorage
            localStorage.setItem("spotifyScopes", scopes);
          }
    
       
        if (token) {
          const response = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const userData = await response.json();
            const userId = userData.id; 

            setAccessToken(token, userId);
            localStorage.setItem(`spotifyAccessToken_${userId}`, token);
            localStorage.setItem("currentUserId", userId);
            localStorage.setItem("spotifyTokenExpiry", (Date.now() + expiresIn * 1000).toString());
            setTokenHandled(true);

            await saveSpotifyUser(token);

            navigate("/mood-selection");
          } else {
            console.error("Kunde inte hämta användar-ID.");
            navigate("/");
          }

          window.location.hash = "";
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

  return    <div className="loader-container">
              <span className="loader"></span>
            </div>;
};

export default Callback;

