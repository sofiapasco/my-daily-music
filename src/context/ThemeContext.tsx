import React, { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    console.log("Växlar till tema:", newTheme);
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    console.log("Applying theme:", theme); // Debugging
    document.body.className = theme; // Uppdaterar body-klassen

    const updateIcons = () => {
      console.log("Tema ändrat till:", theme);
      const facebookIcon = document.getElementById("fbicon") as HTMLImageElement;
      const copyIcon = document.getElementById("copyicon") as HTMLImageElement;
      const shareIcon = document.getElementById("phoneicon") as HTMLImageElement;
      const userIcon = document.getElementById("usericon") as HTMLImageElement;

      // Uppdatera ikonens källor baserat på tema
      if (facebookIcon) {
        facebookIcon.src = theme === "dark" ? "/FB.png" : "/facebook.png";
      } 

      if (copyIcon) {
        copyIcon.src = theme === "dark" ? "/kopiera.png" : "/copy.png";
      }

      if (shareIcon) {
        shareIcon.src = theme === "dark" ? "/Dela.png" : "/share.png";
      }

      if (userIcon) {
        userIcon.src = theme === "dark" ? "/User1.png" : "/user.png";
      }
    };

    setTimeout(updateIcons, 500); // Uppdatera ikoner när temat ändras
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
