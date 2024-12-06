import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import { useEffect } from "react";

const Login = () => {
  console.log("Login.tsx is rendering!");

    const navigate = useNavigate();
    const { setAccessToken } = useAuth(); 

    const scopes = [
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
    ];
    console.log("Scopes:", scopes.join(" "));

    const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${
      import.meta.env.VITE_SPOTIFY_CLIENT_ID
    }&response_type=token&redirect_uri=${
      import.meta.env.VITE_SPOTIFY_REDIRECT_URI
    }&scope=${encodeURIComponent(scopes.join(" "))}`;    

    console.log("SPOTIFY_CLIENT_ID:", import.meta.env.VITE_SPOTIFY_CLIENT_ID);
console.log("SPOTIFY_REDIRECT_URI:", import.meta.env.VITE_SPOTIFY_REDIRECT_URI);
console.log("AUTH_URL:", AUTH_URL);

  useEffect(() => {
    // Kontrollera om access_token finns i URL:n (hash-fragmentet)
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));
    const accessToken = params.get("access_token");
    const scopes = params.get("scope"); // Hämta scope-parametern
    console.log("Scopes:", scopes);
    
    if (accessToken) {
      const userId = params.get("user_id"); // Om användar-ID finns också i URL:n, annars hämta senare
      // Sätt access-token i contexten
      setAccessToken(accessToken, userId || ""); // Använd access-token och userId (om tillgängligt)
      navigate("/mood-selection"); // Navigera till nästa sida efter inloggning
    }
  }, [setAccessToken, navigate]);
  
    const handleLogin = () => {
        navigate("/mood-selection");
      };

      const storedScopes = localStorage.getItem("spotifyScopes")?.split(" ") || [];
const requiredScopes = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-modify-public",
  "streaming",
  "user-modify-playback-state",
  "user-read-playback-state",
  "user-read-recently-played",
  "user-top-read",
];

const missingScopes = requiredScopes.filter((scope) => !storedScopes.includes(scope));

if (missingScopes.length > 0) {
  console.error("Följande scopes saknas:", missingScopes);
} else {
  console.log("Alla nödvändiga scopes är tillgängliga!");
}

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "black",
          fontFamily: "'Arial', sans-serif",
        }}
      >   
        <h1
          style={{
            textAlign: "center",
            fontSize: "1rem",
            letterSpacing: "5px",
            margin: "0",
            position: "relative",
          }}
        >
         MY DAILY MUSIC
          <span
          className="titleFront"
            style={{
              display: "block",
              width: "60%",
              height: "1px",
              margin: "10px auto 0",
            }}
          ></span>
        </h1>
  
        <a href={AUTH_URL} style={{ textDecoration: "none" }}>
          <button
            onClick={handleLogin}
            style={{
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: "bold",
              backgroundColor: " #922692",
              color: "#e0e0e0",
              border: "none",
              letterSpacing: "2px",
              borderRadius: "30px",
              cursor: "pointer",
              marginTop: "20px",
              display: "flex", 
              alignItems: "center",
              gap: "10px", 
              boxShadow: "0px 1px 2px rgba(0, 0, 0, 1)",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
          >
            Logga in med Spotify 
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
                alt="Spotify Icon"
                style={{ 
                    width: "16px",
                    height: "16px",}}
            />
          </button>
        </a>
      </div>
    );
  };
  
  export default Login;
  