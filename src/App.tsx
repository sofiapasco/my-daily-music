import { Routes, Route, } from 'react-router-dom';
import Login from "./pages/Login";
import Callback from "./pages/Callback";
import DailySong from "./pages/DailySong";

function App() {
    return (
  
          <Routes>
           <Route path="/" element={<Login />} />          
           <Route path="/callback" element={<Callback />} /> 
           <Route path="/daily-song" element={<DailySong />} /> 
          </Routes>
  
    );
  }
  
  export default App;