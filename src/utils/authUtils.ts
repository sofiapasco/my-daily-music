export const getAccessToken = (): string | null => {
    const tokenKey = "spotifyAccessToken_sofiakitsou"; // Nyckeln för din access token
    const token = localStorage.getItem(tokenKey);
    console.log("Access Token hämtad:", token); // För debug
    return token;
  };
  
  export const clearAccessToken = () => {
    const tokenKey = "spotifyAccessToken_sofiakitsou"; 
    localStorage.removeItem(tokenKey);
    console.log("Access Token har tagits bort.");
  };
  
  export const saveAccessToken = (token: string) => {
    const tokenKey = "spotifyAccessToken_sofiakitsou";
    localStorage.setItem(tokenKey, token);
    console.log("Access Token sparad:", token);
  };
  