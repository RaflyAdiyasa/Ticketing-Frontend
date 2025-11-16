import LoginPage from "./Pages/LoginPage";
import DaftarPage from "./Pages/DaftarPage";
import DaftarEOPage from "./Pages/DaftarEOPage";
import LandingPage from "./Pages/LandingPage";
import { BrowserRouter, Routes, Route } from "react-router";
import CariEvent from "./Pages/CariEventPage";
import EventDetail from "./Pages/DetailEventPage";
import EventRegister from "./Pages/EventRegister";
import Keranjang from "./Pages/KeranjangPage";
import TiketSaya from "./Pages/TiketSayaPage";
import EventSaya from "./Pages/EventSayaPage";
import VerifikasiEvent from "./Pages/VerifikasiEventPage";
import LihatProfilPage from "./Pages/LihatProfilPage";
import VerifikasiUserPage from "./Pages/VerifikasiUserPage";
import TinjauUserDetailPage from "./Pages/TinjauUserDetailPage";
import LaporanEventPage from "./Pages/LaporanEventPage"
import RiwayatTransaksi from "./Pages/RiwayatPembelianPage";

function App() {
  return (
    <div className="min-h-screen bg-[#E5E7EB] text-black">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/daftar" element={<DaftarPage />} />
          <Route path="/daftarEO" element={<DaftarEOPage />} />
          <Route path="/daftar-event" element={<EventRegister />} />
          <Route path="/cariEvent/:namaEvent?" element={<CariEvent />} />
          <Route path="/verifikasiUser" element={<VerifikasiUserPage />} />
          <Route path="/tinjauUser/:id" element={<TinjauUserDetailPage />} />
          <Route path="/detailEvent/:id" element={<EventDetail />} />
          <Route path="/keranjang" element={<Keranjang />} />
          <Route path="/laporan/:eventId" element={<LaporanEventPage />} />
          {/* Route baru untuk role-based pages */}
          <Route path="/tiket-saya" element={<TiketSaya />} />
          <Route path="/event-saya" element={<EventSaya />} />
          <Route path="/verifikasi-event" element={<VerifikasiEvent />} />
          <Route path="/lihat-profil" element={<LihatProfilPage />} />
           <Route path="/riwayat-transaksi" element={<RiwayatTransaksi />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
