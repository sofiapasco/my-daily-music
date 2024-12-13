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
      popularity: [50, 100],
      duration_ms: [120000, 300000],
      genres: baseMoodGenres.happy,
    },
    low: {
      popularity: [0, 60],
      duration_ms: [200000, 600000],
      genres: baseMoodGenres.low,
    },
    energetic: {
      popularity: [50, 110],
      duration_ms: [100000, 240000],
      genres: baseMoodGenres.energetic,
    },
    relaxed: {
      popularity: [30, 90],
      duration_ms: [200000, 450000],
      genres: baseMoodGenres.relaxed,
    },
    love: {
      popularity: [40, 100],
      duration_ms: [150000, 400000],
      genres: baseMoodGenres.love,
    },
  };
  
  // Exportera basgenrer separat om du vill använda dem direkt
  export const moodGenreMap = baseMoodGenres;
  