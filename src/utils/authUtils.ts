export const getAccessToken = (): string | null => {
    const tokenKey = "spotifyAccessToken_sofiakitsou"; 
    const token = localStorage.getItem(tokenKey);
    return token;
  };
  
  export const clearAccessToken = () => {
    const tokenKey = "spotifyAccessToken_sofiakitsou"; 
    localStorage.removeItem(tokenKey);
  };
  
  export const saveAccessToken = (token: string) => {
    const tokenKey = "spotifyAccessToken_sofiakitsou";
    localStorage.setItem(tokenKey, token);
  };
  