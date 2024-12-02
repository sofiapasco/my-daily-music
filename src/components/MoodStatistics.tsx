import React, { useEffect, useState } from "react";
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
  const [moodData, setMoodData] = useState<{ date: string; mood: string }[]>([]);

  useEffect(() => {
    try {
      const moodHistory = JSON.parse(localStorage.getItem("moodData") || "[]");
      console.log("Hämtad data från localStorage:", moodHistory); // Kontrollera om data hämtas korrekt
      if (Array.isArray(moodHistory)) {
        setMoodData(moodHistory);
      } else {
        console.warn("Felaktig data i localStorage, återställning av humördata.");
        localStorage.setItem("moodData", "[]");
      }
    } catch (e) {
      console.error("Fel vid hämtning av humördata:", e);
      localStorage.setItem("moodData", "[]");
    }
  }, []);

  const dates = moodData.map((entry) => entry.date);
  const moods = moodData.map((entry) => {
    switch (entry.mood) {
      case "😊": return 5;
      case "🥰": return 4;
      case "😌": return 3;
      case "💪": return 2;
      case "😴": return 1;
      case "😢": return 0;
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

  const options: ChartOptions<'line'> = {
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
                default: return "Okänt";
              }
            }
            return tickValue;
          },
        },
        min: 0,
        max: 5,
      },
    },
  };

  return (
    <div style={{ width: "80%", height: "400px", margin: "auto" }}>
      <h2>Humörstatistik</h2>
      {moodData.length > 0 ? (
        <Line data={data} options={options} />
      ) : (
        <p>Ingen humördata hittades. Börja logga ditt humör!</p>
      )}
    </div>
  );
};

export default MoodStatistics;

