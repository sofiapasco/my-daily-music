import React, { createContext, useState, useContext } from "react";

type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("spotifyAccessToken"));

  const logout = () => {
    localStorage.removeItem("spotifyAccessToken"); 
    setAccessToken(null); 
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken,logout }}>
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
