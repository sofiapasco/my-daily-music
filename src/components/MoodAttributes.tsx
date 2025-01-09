import { MoodFilters } from "../types/song";

// Basdata för genrer
const baseMoodGenres: Record<string, string[]> = {
    happy: [
      "pop",
      "dance",
      "upbeat",
      "worship",
      "disco",
      "electro pop",
      "funk",
      "k-pop",
      "reggae fusion",
      "afrobeat",
      "greek pop"
    ],
    low: [
      "sad",
      "melancholic",
      "blues",
      "instrumental",
      "worship",
      "lo-fi",
      "slowcore",
      "acoustic blues",
      "piano ballads",
      "folk singer-songwriter",
      "chamber pop",
    ],
    energetic: [
      "rock",
      "electronic",
      "hip hop",
      "worship",
      "alternative rock",
      "punk rock",
      "drum and bass",
      "trance",
      "dubstep",
      "techno",
      "latin pop",
      "afrobeat",
      "greek hip hop",
      "laïkó",
    ],
    relaxed: [
      "acoustic",
      "chill",
      "ambient",
      "instrumental",
      "smooth jazz",
      "neo-soul",
      "lo-fi hip hop",
      "bossa nova",
      "chillout",
      "new age",
      "soft rock",
      "vocal jazz",
    ],
    love: [
      "soul",
      "r&b",
      "romantic",
      "worship",
      "adult contemporary",
      "romantic ballads",
      "slow jam",
      "latin love songs",
      "acoustic pop",
      "dream pop",
      "soft r&b",
    ],
  };
  
  // moodAttributes genererat från baseMoodGenres
  export const moodAttributes: Record<string, MoodFilters & { genres?: string[] }> = {
    happy: {
      genres: baseMoodGenres.happy,
    },
    low: {
      genres: baseMoodGenres.low,
    },
    energetic: {
      genres: baseMoodGenres.energetic,
    },
    relaxed: {
      genres: baseMoodGenres.relaxed,
    },
    love: {
      genres: baseMoodGenres.love,
    },
    neutral: {
      genres: [],
    },
  };
  
  export const moodGenreMap = baseMoodGenres;
  