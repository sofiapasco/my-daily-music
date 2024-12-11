import React, { createContext, useState, useContext, useEffect } from "react";

type UserProfileProps = {
  name: string;
  email: string;
  avatarUrl: string;
};

type AuthContextType = {
  accessToken: string | null;
  userId: string | null;
  userInfo: UserProfileProps | null;
  setAccessToken: (token: string | null, userId: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(localStorage.getItem("currentUserId"));
  const [accessToken, setAccessTokenState] = useState<string | null>(
    userId ? localStorage.getItem(`spotifyAccessToken_${userId}`) : null
  );
  const [userInfo, setUserInfo] = useState<UserProfileProps | null>(null);

  const setAccessToken = (token: string | null, id: string) => {
    if (token && id) {
      localStorage.setItem(`spotifyAccessToken_${id}`, token);
      localStorage.setItem("currentUserId", id);
      setAccessTokenState(token);
      setUserId(id);
      fetchUserInfo(token); // Hämta användarinfo när en ny token sätts
    } else {
      handleLogout();
    }
  };

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUserInfo({
          name: data.display_name || "Anonym",
          email: data.email || "example@example.com",
          avatarUrl: data.images?.[0]?.url || "/default-avatar.png",
        });
      } else {
        console.error("Kunde inte hämta användarinformation.");
      }
    } catch (error) {
      console.error("Ett fel uppstod vid hämtning av användarinformation:", error);
    }
  };

  const handleLogout = () => {
    if (userId) {
      localStorage.removeItem(`spotifyAccessToken_${userId}`);
      localStorage.removeItem("currentUserId");
    }
    setAccessTokenState(null);
    setUserId(null);
    setUserInfo(null);
  
    // Omdirigera användaren till Spotify logout-sidan
    const spotifyLogoutUrl = "https://accounts.spotify.com/logout";
    const redirectUrl = "http://localhost:5173/"; // Din startsida efter logout
  
    // Försök att logga ut från Spotify och omdirigera användaren tillbaka
    window.location.href = `${spotifyLogoutUrl}?continue=${encodeURIComponent(redirectUrl)}`;
  };


  useEffect(() => {
    if (accessToken) {
      fetchUserInfo(accessToken);
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ accessToken, userId, userInfo, setAccessToken, logout:handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth måste användas inom AuthProvider");
  }
  return context;
};