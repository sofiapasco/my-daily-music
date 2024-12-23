import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MoodStatistics: React.FC = () => {
  const { userId } = useAuth();
  const [moodData, setMoodData] = useState<{ date: string; mood: string }[]>([]);

  useEffect(() => {
    if (!userId) {
      console.warn("Ingen användare inloggad. Kan inte hämta humördata.");
      return;
    }
    
    try {
      const moodHistoryKey = `moodData_${userId}`; // Nyckeln inkluderar userId
      const moodHistory = JSON.parse(localStorage.getItem(moodHistoryKey) || "[]");
      if (Array.isArray(moodHistory)) {
        setMoodData(moodHistory);
      } else {
        console.warn("Felaktig data i localStorage, återställning av humördata.");
        localStorage.setItem(moodHistoryKey, "[]");
      }
    } catch (e) {
      console.error("Fel vid hämtning av humördata:", e);
      localStorage.setItem(`moodData_${userId}`, "[]");
    }
  }, [userId]);



  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  const recentMoodData = moodData.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= oneWeekAgo && entryDate <= now;
  });

  const sortedRecentMoodData = recentMoodData
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sortera datan efter datum
  .slice(-7); // Begränsa till max 7 poster


  console.log("Filtrerad data för senaste veckan:", recentMoodData);

  // Data för grafen
  const dates = sortedRecentMoodData.map((entry) => entry.date);
  const moods = sortedRecentMoodData.map((entry) => {
    switch (entry.mood) {
      case "😊": return 5;
      case "🥰": return 4;
      case "😌": return 3;
      case "💪": return 2;
      case "😴": return 1;
      case "😢": return 0;
      case "hoppa över": return -1; 
      default: return -1;
    }
  });  

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Humör över tid",
        data: moods,
        borderColor: "rgba(128, 0, 128, 1)",
        backgroundColor: "rgba(128, 0, 128, 0.2)",
        pointRadius: 6,
        pointBackgroundColor: "rgba(75, 0, 130, 1)",
        pointBorderColor: "rgba(255, 255, 255, 1)",
        pointBorderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Humörstatistik" },
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1,
          callback: function (tickValue) {
            if (typeof tickValue === "number") {
              switch (tickValue) {
                case 5: return "Mycket Glad 😊";
                case 4: return "Kärleksfull 🥰";
                case 3: return "Lugn 😌";
                case 2: return "Stark 💪";
                case 1: return "Trött 😴";
                case 0: return "Ledsen 😢";
                case -1: return "Hoppa över";
                default: return "Okänt";
              }
            }
            return tickValue;
          },
        },
        min: -1,
        max: 5,
      },
    },
  };

  return (
    <div className="chart-container">
      {recentMoodData.length > 0 ? (
        <Line data={data} options={options} />
      ) : (
        <p>Ingen humördata hittades för den senaste veckan. Börja logga ditt humör!</p>
      )}
    </div>
  );
};

export default MoodStatistics;
