import { MoodFilters } from "../types/song";

export const moodAttributes: Record<string, MoodFilters> = {
    happy: {
        popularity: [50, 100], 
        duration_ms: [120000, 300000], 
    },
    low: {
        popularity: [0, 60], 
        duration_ms: [200000, 600000], 
    },
    energetic: {
        popularity: [50, 110], 
        duration_ms: [100000, 240000], 
    },
    relaxed: {
        popularity: [30, 90], 
        duration_ms: [200000, 450000], 
    },
    love: {
        popularity: [40, 100],
        duration_ms: [150000, 400000], 
    },
};