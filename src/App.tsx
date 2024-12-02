import { Routes, Route, } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Callback from "./pages/Callback";
import DailySong from "./pages/DailySong";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastContainer } from "react-toastify";
import MoodSelection from "./pages/MoodSelection";
import SavedSongs from './pages/SavedSongs';
import ErrorPage from './pages/ErrorPage';
import UserProfilePage from "./pages/UserProfilePage"
import StatisticsPage from './pages/StatisticsPage';


import "../src/assets/App.scss";

function App() {
    return (
    <ThemeProvider>
      <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
          <Routes>
            <Route path="/" element={<Login />} />          
            <Route path="/callback" element={<Callback />} /> 
            <Route path="/daily-song" element={<DailySong />} /> 
            <Route path="/mood-selection" element={<MoodSelection />} />
            <Route path="/saved-songs" element={<SavedSongs />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/error" element={<ErrorPage />} />
          </Routes>
      </AuthProvider>
    </ThemeProvider>
  
    );
  }
  
  export default App;