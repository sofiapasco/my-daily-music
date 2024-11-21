export const fetchSpotifyUserData = async (accessToken: string) => {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch Spotify user data: ${response.status}`);
    }
  
    return response.json();
  };
  