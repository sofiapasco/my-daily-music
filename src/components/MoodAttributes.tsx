import { MoodFilters } from "../types/Song";

export const moodAttributes: Record<string, MoodFilters> = {
    happy: {
        popularity: [60, 100], // Mer populära låtar
        duration_ms: [120000, 300000], // Medel till långa låtar
    },
    low: {
        popularity: [0, 50], // Mindre populära låtar
        duration_ms: [200000, 600000], // Längre låtar
    },
    energetic: {
        popularity: [50, 100], // Populära låtar
        duration_ms: [100000, 240000], // Kortare låtar för energi
    },
    relaxed: {
        popularity: [30, 80], // Mindre populära låtar
        duration_ms: [200000, 450000], // Längre låtar
    },
    love: {
        popularity: [40, 90], // Mellan populära låtar
        duration_ms: [150000, 400000], // Medellånga låtar
    },
};
