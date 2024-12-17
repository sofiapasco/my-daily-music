import React, { createContext, useState, useContext, useEffect } from "react";

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

  // **1. Validera token**
  const validateAccessToken = async () => {
    if (!accessToken || !userId) {
      handleLogout(); // Token saknas, logga ut
      return false;
    }

    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        console.warn("Token är ogiltig eller utgången.");
        handleLogout();
        return false;
      }
      return true; // Token är giltig
    } catch (error) {
      console.error("Fel vid validering av token:", error);
      handleLogout();
      return false;
    }
  };

  // **2. Logga ut funktion**
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
    window.location.href = `${spotifyLogoutUrl}?continue=${encodeURIComponent(redirectUrl)}`;
  };

  // **3. Sätt accessToken och användarinformation**
  const setAccessToken = (token: string | null, id: string) => {
    if (token && id) {
      localStorage.setItem(`spotifyAccessToken_${id}`, token);
      localStorage.setItem("currentUserId", id);
      setAccessTokenState(token);
      setUserId(id);
      fetchUserInfo(token, id);
    } else {
      handleLogout();
    }
  };

  // **4. Hämta användarinformation**
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
          avatarUrl: data.images?.[0]?.url || `https://via.placeholder.com/150/cccccc/FFFFFF?text=${id.charAt(0).toUpperCase()}`,
          product: data.product || "Free",
        });
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Ett fel uppstod vid hämtning av användarinformation:", error);
      handleLogout();
    }
  };

  // **5. Kontrollera och validera token vid start**
  useEffect(() => {
    const checkToken = async () => {
      const isValid = await validateAccessToken();
      if (!isValid) console.warn("Användaren har loggats ut pga ogiltig token.");
    };

    if (accessToken && userId) {
      checkToken();
    }
  }, [accessToken, userId]);

  // **6. Skapa kontext och exportera**
  return (
    <AuthContext.Provider value={{ accessToken, userId, userInfo, setAccessToken, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook för att använda AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth måste användas inom AuthProvider");
  }
  return context;
};
