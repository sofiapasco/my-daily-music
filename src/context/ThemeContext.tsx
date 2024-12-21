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
    document.body.className = theme; 

    const updateIcons = () => {
      const facebookIcon = document.getElementById("fbicon") as HTMLImageElement;
      const copyIcon = document.getElementById("copyicon") as HTMLImageElement;
      const shareIcon = document.getElementById("phoneicon") as HTMLImageElement;
      const userIcon = document.getElementById("usericon") as HTMLImageElement;
      const commentIcon = document.getElementById("commenticon") as HTMLImageElement;

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
        userIcon.src = theme === "dark" ? "/User1.png" : "/User1.png";
      }

      if (commentIcon) {
        commentIcon.src = theme === "dark" ? "/comment1.png" : "/comment.png";
      }
    };

    setTimeout(updateIcons, 500); 
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
