import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();

    const scopes = [
      "user-read-private",
      "user-read-email",
      "user-top-read",
      "user-read-recently-played",
      "user-library-modify",
      "user-library-read",
      "streaming",
      "playlist-read-private",
      "playlist-modify-private",
      "playlist-modify-public",
      "user-modify-playback-state"
    ];
    
    const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${
      import.meta.env.VITE_SPOTIFY_CLIENT_ID
    }&response_type=token&redirect_uri=${
      import.meta.env.VITE_SPOTIFY_REDIRECT_URI
    }&scope=${encodeURIComponent(scopes.join(" "))}`;
    
  
    const handleLogin = () => {
        navigate("/mood-selection");
      };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f8f3f3",
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
              backgroundColor: "black",
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
              color: "#f8f3f3",
              border: "none",
              letterSpacing: "2px",
              borderRadius: "30px",
              cursor: "pointer",
              marginTop: "20px",
              display: "flex", 
              alignItems: "center",
              gap: "10px", 
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 2)",
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
  