import LoginPage from "./Pages/LoginPage";
import DaftarPage from "./Pages/DaftarPage";
import DaftarEOPage from "./Pages/DaftarEOPage";
import LandingPage from "./Pages/LandingPage";
import {BrowserRouter, Routes, Route} from "react-router"
import CariEvent from "./Pages/CariEventPage";
import EventDetail from "./Pages/DetailEventPage";




function App() {
  return (
    <div className="min-h-screen bg-[#E5E7EB] text-black">

      <BrowserRouter>

      
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/daftar" element={<DaftarPage/>} />
        <Route path="/daftarEO" element={<DaftarEOPage/>} />
         <Route path="/cariEvent/:namaEvent?" element={<CariEvent/>} />
         <Route path="/detailEvent/:id" element={<EventDetail />} />
      </Routes>
      
      </BrowserRouter>
     
      {/* This is a JSX comment <LoginPage/>*/}
      
     
     
     
     
    </div>
  );
}

export default App;
