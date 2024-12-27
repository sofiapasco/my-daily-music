import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type UserProfileProps = {
  name: string;
  email: string;
  avatarUrl?: string;
  product?: string;
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
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const navigate = useNavigate();

  const setAccessToken = (token: string | null, id: string, redirectUrl?: string) => {
    if (token && id) {
      localStorage.setItem(`spotifyAccessToken_${id}`, token);
      localStorage.setItem("currentUserId", id);
      setAccessTokenState(token);
      setUserId(id);
      if (redirectUrl) {
        setRedirectTo(redirectUrl); 
      }
      fetchUserInfo(token, id); 
    } else {
      handleLogout();
    }
  };

  useEffect(() => {
    if (redirectTo && accessToken && userId) {
      navigate(redirectTo); 
      setRedirectTo(null); 
    }
  }, [redirectTo, accessToken, userId, navigate]);
  

  const generateColorFromText = (text: string): string => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 50%)`; 
    return color.replace("#", ""); 
  };

  useEffect(() => {
    const tokenExpiryTime = localStorage.getItem(`tokenExpiry_${userId}`);
    if (accessToken && tokenExpiryTime) {
      if (Date.now() > Number(tokenExpiryTime)) {
        console.log("Token har gått ut. Loggar ut användaren.");
        handleLogout(); // Token har gått ut
      } else {
        fetchUserInfo(accessToken, userId!);
      }
    }
  }, [accessToken, userId]);
  
  const fetchUserInfo = async (token: string, id: string) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUserInfo({
          name: data.display_name || id || "Anonym",
          email: data.email || "example@example.com",
          avatarUrl:
            data.images?.[0]?.url ||
            `https://via.placeholder.com/150/${generateColorFromText(id)}/FFFFFF?text=${id
              .charAt(0)
              .toUpperCase()}`, // Dynamisk färg baserat på id
          product: data.product || "Free",
        });
      } else {
        console.error("Kunde inte hämta användarinformation.");
        setUserInfo({
          name: id,
          email: "example@example.com",
          avatarUrl: `https://via.placeholder.com/150/${generateColorFromText(id)}/FFFFFF?text=${id
            .charAt(0)
            .toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error("Ett fel uppstod vid hämtning av användarinformation:", error);
      setUserInfo({
        name: id,
        email: "example@example.com",
        avatarUrl: `https://via.placeholder.com/150/${generateColorFromText(id)}/FFFFFF?text=${id
          .charAt(0)
          .toUpperCase()}`,
      });
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
  

    const spotifyLogoutUrl = "https://accounts.spotify.com/logout";
    const redirectUrl = "https://mydailymusic.netlify.app/"; 
  
    const logoutAndRedirect = () => {
      window.location.href = `${spotifyLogoutUrl}?continue=${encodeURIComponent(redirectUrl)}`;
    };
  
    const logoutWindow = window.open(spotifyLogoutUrl, "_blank");
    if (logoutWindow) {

      setTimeout(() => {
        logoutWindow.close();
        window.location.href = redirectUrl;
      }, 1000); 
    } else {
      logoutAndRedirect();
    }
  };
  
  

  useEffect(() => {
    if (accessToken && userId) { 
      fetchUserInfo(accessToken, userId);
    }
  }, [accessToken, userId]);

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