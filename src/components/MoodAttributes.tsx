import { MoodFilters } from "../types/Song";

export const moodAttributes: Record<string, MoodFilters> = {
    happy: {
      tempo: [100, 170], // Snabbt tempo
      popularity: [50, 100],
      duration_ms: [100000, 400000],
      valence: [0.6, 1.0], // Glada låtar
    },
    low: {
      instrumentalness: [0.3, 1.0], // Mer instrumentellt
      tempo: [50, 110], 
      popularity: [0, 60],
      duration_ms: [180000, 600000],
      valence: [0.0, 0.4], // Melankoliskt
    },
    energetic: {
      tempo: [110, 220], // Högt tempo
      popularity: [40, 100],
      duration_ms: [120000, 300000],
      danceability: [0.7, 1.0], // Hög dansbarhet
    },
    relaxed: {
      instrumentalness: [0.5, 1.0], // Mer instrumentellt
      acousticness: [0.4, 1.0], // Akustiskt fokus
      popularity: [30, 80],
      tempo: [50, 110], 
      duration_ms: [200000, 500000],
      valence: [0.2, 0.7], // Avslappnat spektrum
    },
    love: {
      tempo: [60, 120], // Medellångt tempo
      popularity: [40, 90],
      duration_ms: [150000, 400000],
      valence: [0.6, 1.0], // Positiv känsla
      acousticness: [0.3, 1.0], // Akustiskt
    },
  };
  