import { Routes, Route, } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Callback from "./pages/Callback";
import DailySong from "./pages/DailySong";
import MoodSelection from "./pages/MoodSelection";
import ErrorPage from './pages/ErrorPage';


import "../src/assets/App.scss";

function App() {
    return (
      <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />          
            <Route path="/callback" element={<Callback />} /> 
            <Route path="/daily-song" element={<DailySong />} /> 
            <Route path="/mood-selection" element={<MoodSelection />} />
            <Route path="/error" element={<ErrorPage />} />
          </Routes>
      </AuthProvider>
  
    );
  }
  
  export default App;