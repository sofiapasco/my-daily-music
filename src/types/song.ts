export interface Song {
  id: string;
  name: string;
  artists: Artist[];
  album: {
    images: { url: string }[];
  };
  external_urls: {
    spotify: string;
  };
}

  export interface Artist {
    id: string;
    name: string;
  }

  export interface Album {
    id: string;
    name: string;
    images: { url: string }[]; 
  }

  export type LikeSongButtonProps = {
    trackId: string;
    accessToken: string;
  };

  export interface Track {
    id: string;
    name: string;
    artists: { name: string; id: string }[]; // Lägg till 'id' här
    album: { images: { url: string }[]; name: string };
    external_urls: { spotify: string };
    duration_ms: number;
    tempo?: number;
    popularity: number;
    currentTime?: number;
    danceability?: number;
    acousticness?: number;
    instrumentalness?: number;
  }
  
  export interface RecentlyPlayedItem {
    track: Track;
  }

  export interface MoodFilters {
    tempo?: [number, number];
    popularity?: [number, number];
    duration_ms?: [number, number];
    valence?: [number, number];
    danceability?: [number, number];
    instrumentalness?: [number, number];
    acousticness?: [number, number];
    explicit?: boolean;
  }
  