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
import CheckinTiket from "./Pages/CheckinTiketPage";
import EditEventPage from "./Pages/EditEventPage";
import CalendarEventPage from "./Pages/CalendarEventPage";
import LikedEventsPage from "./Pages/LikedEventsPage";
import AturEventPage from "./Pages/AturEventPage";
import LaporkanMasalahPage from "./Pages/LaporkanMasalahPage";
import LaporanMasalahPage from "./Pages/LaporanMasalahPage";
import ProtectedRouteWrapper from "./components/ProtectedRouteWrapper";

function App() {
  return (
    <div className="min-h-screen bg-[#E5E7EB] text-black">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/daftar" element={<DaftarPage />} />
          <Route path="/daftarEO" element={<DaftarEOPage />} />
          <Route path="/cariEvent/:namaEvent?" element={<CariEvent />} />
          <Route path="/detailEvent/:id" element={<EventDetail />} />
          <Route path="/kalender-event" element={<CalendarEventPage />} />

          {/* Protected - Semua User Login */}
          <Route path="/lihat-profil" element={<ProtectedRouteWrapper><LihatProfilPage /></ProtectedRouteWrapper>} />

          {/* Protected - Khusus User */}
          <Route path="/keranjang" element={<ProtectedRouteWrapper allowedRoles={["user"]}><Keranjang /></ProtectedRouteWrapper>} />
          <Route path="/tiket-saya" element={<ProtectedRouteWrapper allowedRoles={["user"]}><TiketSaya /></ProtectedRouteWrapper>} />
          <Route path="/riwayat-transaksi" element={<ProtectedRouteWrapper allowedRoles={["user"]}><RiwayatTransaksi /></ProtectedRouteWrapper>} />
          <Route path="/event-disukai" element={<ProtectedRouteWrapper allowedRoles={["user"]}><LikedEventsPage /></ProtectedRouteWrapper>} />
          
          {/* Protected - Khusus User & organizer */}
          <Route path="/laporkan-masalah" element={<ProtectedRouteWrapper allowedRoles={["user","organizer"]}><LaporkanMasalahPage /></ProtectedRouteWrapper>} />

          {/* Protected - Khusus EO */}
          <Route path="/event-saya" element={<ProtectedRouteWrapper allowedRoles={["organizer"]}><EventSaya /></ProtectedRouteWrapper>} />
          <Route path="/daftar-event" element={<ProtectedRouteWrapper allowedRoles={["organizer"]}><EventRegister /></ProtectedRouteWrapper>} />
          <Route path="/edit-event/:id" element={<ProtectedRouteWrapper allowedRoles={["organizer"]}><EditEventPage /></ProtectedRouteWrapper>} />
          <Route path="/laporan/:eventId" element={<ProtectedRouteWrapper allowedRoles={["organizer"]}><LaporanEventPage /></ProtectedRouteWrapper>} />
          <Route path="/scan/:eventId" element={<ProtectedRouteWrapper allowedRoles={["organizer"]}><CheckinTiket /></ProtectedRouteWrapper>} />
          

          {/* Protected - Khusus Admin */}
          <Route path="/atur-event" element={<ProtectedRouteWrapper allowedRoles={["admin"]}><AturEventPage /></ProtectedRouteWrapper>} />
          <Route path="/verifikasi-event" element={<ProtectedRouteWrapper allowedRoles={["admin"]}><VerifikasiEvent /></ProtectedRouteWrapper>} />
          <Route path="/verifikasiUser" element={<ProtectedRouteWrapper allowedRoles={["admin"]}><VerifikasiUserPage /></ProtectedRouteWrapper>} />
          <Route path="/tinjauUser/:id" element={<ProtectedRouteWrapper allowedRoles={["admin"]}><TinjauUserDetailPage /></ProtectedRouteWrapper>} />
          <Route path="/laporanMasalah" element={<ProtectedRouteWrapper allowedRoles={["admin"]}><LaporanMasalahPage /></ProtectedRouteWrapper>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;