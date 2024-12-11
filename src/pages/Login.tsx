import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const Login = () => {
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

  const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${
    import.meta.env.VITE_SPOTIFY_CLIENT_ID
  }&response_type=token&redirect_uri=${
    import.meta.env.VITE_SPOTIFY_REDIRECT_URI
  }&scope=${encodeURIComponent(scopes.join(" "))}&prompt=login`;

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("access_token")) return;

    const params = new URLSearchParams(hash.replace("#", "?"));
    const accessToken = params.get("access_token");

    if (accessToken) {
      fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.id) {
            setAccessToken(accessToken, data.id);
            navigate("/mood-selection");
          }
        })
        .catch((error) => console.error("Fel vid hämtning av användarinfo:", error));
    }
  }, [setAccessToken, navigate]);

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
          style={{
            padding: "8px 16px",
            fontSize: "12px",
            fontWeight: "bold",
            background: "linear-gradient(135deg, #922692, #bb4180c6",
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
              height: "16px",
            }}
          />
        </button>
      </a>
    </div>
  );
};

export default Login;
