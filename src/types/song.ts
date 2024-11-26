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
    genres: string[];
  }

  export type LikeSongButtonProps = {
    trackId: string;
    accessToken: string;
  };

  
export interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[]; name: string };
  external_urls: { spotify: string };

}
