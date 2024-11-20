export const initializePlayer = (accessToken: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.Spotify) {
        console.log("Försöker ansluta Spotify Player...");
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
  
        script.onload = () => {
          setupPlayer();
        };
  
        script.onerror = () => {
          reject("Kunde inte ladda Spotify Web Playback SDK.");
        };
      } else {
        setupPlayer();
      }
  
      function setupPlayer() {
        if (!window.Spotify) {
          reject("Spotify Web Playback SDK kunde inte initieras.");
          return;
        }
  
        const player = new window.Spotify.Player({
          name: "My Daily Music Player",
          getOAuthToken: (cb: (token: string) => void) => {
            cb(accessToken);
          },
        });
  
        player.addListener("ready", ({ device_id }: { device_id: string }) => {
          console.log("Device ID:", device_id);
          resolve(device_id);
        });
  
        player.addListener("initialization_error", ({ message }: { message: string }) => {
          console.error("Initialization Error:", message);
          reject(message);
        });
  
        player.connect();
      }
    });
  };
  