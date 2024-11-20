import { Routes, Route, } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Callback from "./pages/Callback";
import DailySong from "./pages/DailySong";

import "../src/assets/App.scss";

function App() {
    return (
      <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />          
            <Route path="/callback" element={<Callback />} /> 
            <Route path="/daily-song" element={<DailySong />} /> 
          </Routes>
      </AuthProvider>
  
    );
  }
  
  export default App;