import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${import.meta.env.VITE_SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${import.meta.env.VITE_SPOTIFY_REDIRECT_URI}&scope=user-top-read`;
  
    const handleLogin = () => {
        // Här kan du implementera token-hantering om det behövs
        // När användaren har loggat in, navigera till "Daily Song"
        navigate("/daily-song");
      };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#121212",
          color: "white",
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
              backgroundColor: "white",
              margin: "10px auto 0",
            }}
          ></span>
        </h1>
  
        <a href={AUTH_URL} style={{ textDecoration: "none" }}>
          <button
            onClick={handleLogin}
            style={{
              padding: "8px 16px",
              fontSize: "16px",
              backgroundColor: "white",
              color: "#1DB954",
              border: "none",
              borderRadius: "30px",
              cursor: "pointer",
              marginTop: "20px",
              display: "flex", 
              alignItems: "center",
              gap: "10px", 
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 1)",
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
  