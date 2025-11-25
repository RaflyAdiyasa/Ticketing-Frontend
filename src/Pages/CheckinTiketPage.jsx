// Pages/CheckinTiket.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function CheckinTiket() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const scannerRef = useRef(null);

  // Data tiket dummy
  const dummyTicketData = {
    ticketId: "TKT-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    eventName: `Event ${eventId}`,
    ticketType: "VIP",
    price: "Rp 250.000,-",
    buyerName: "Ahmad Wijaya",
    purchaseDate: "28 Nov 2025",
    status: "Valid",
    seat: "A-15",
    checkInTime: new Date().toLocaleTimeString()
  };

  // RELOAD SEBELUM TAMPIL: Gunakan URL parameter untuk menghindari infinite loop
  useEffect(() => {
    const url = new URL(window.location.href);
    
    // Cek jika sudah reload
    if (url.searchParams.get('reloaded') === 'true') {
      setIsLoaded(true);
      return;
    }
    
    // Jika belum reload, tambahkan parameter dan reload
    url.searchParams.set('reloaded', 'true');
    window.location.href = url.toString();
  }, []);

  // BUAT SEPERTI TAB BARU - HAPUS SEMUA HISTORY
  useEffect(() => {
    if (isLoaded) {
      // Hapus parameter dari URL
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState(null, '', cleanUrl);
      
      // CLEAR ALL HISTORY - buat seperti tab baru
      // Simpan current URL
      const currentUrl = window.location.href;
      
      // Replace semua history dengan state kosong
      window.history.replaceState(null, '', currentUrl);
      
      // Untuk beberapa browser, kita perlu melakukan push state juga
      setTimeout(() => {
        window.history.pushState(null, '', currentUrl);
        
        // Lock history - prevent back navigation
        const handlePopState = (event) => {
          // Immediately push current state kembali
          window.history.pushState(null, '', currentUrl);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
          window.removeEventListener('popstate', handlePopState);
        };
      }, 100);
    }
  }, [isLoaded]);

  // ATAU PENDEKATAN LEBIH AGGRESSIVE - Replace current entry dan lock
  useEffect(() => {
    if (isLoaded) {
      // Approach 2: Ganti current entry dan lock
      const currentUrl = window.location.href;
      
      // Ganti state saat ini dengan state kosong
      window.history.replaceState(null, '', currentUrl);
      
      // Push state baru untuk mengunci
      window.history.pushState(null, '', currentUrl);
      
      // Lock history - prevent any navigation
      const handlePopState = (event) => {
        // Langsung ganti dengan state saat ini
        window.history.replaceState(null, '', currentUrl);
        window.history.pushState(null, '', currentUrl);
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isLoaded]);

  // Clean function untuk membersihkan scanner
  const cleanUpScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.log("Scanner cleanup error:", error);
      });
      scannerRef.current = null;
    }
  }, []);

  // Fungsi untuk handle semua jenis navigasi keluar dari halaman ini
  const handleNavigationAway = useCallback((targetPath = '/') => {
    cleanUpScanner();
    window.location.href = targetPath;
  }, [cleanUpScanner]);

  // Override navbar links
  useEffect(() => {
    if (!isLoaded) return;

    const overrideNavLinks = () => {
      const navLinks = document.querySelectorAll('nav a[href*="/"]');
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('checkin')) {
          link.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNavigationAway(href);
          };
        }
      });
    };

    const timer = setTimeout(overrideNavLinks, 300);
    return () => clearTimeout(timer);
  }, [handleNavigationAway, isLoaded]);

  // Fungsi untuk memulai scanner
  const startScanner = useCallback(() => {
    if (!isLoaded) return;

    cleanUpScanner();

    let readerElement = document.getElementById('reader');
    if (!readerElement) {
      readerElement = document.createElement('div');
      readerElement.id = 'reader';
      document.getElementById('scanner-container').appendChild(readerElement);
    }

    const newScanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 500, height: 500 },
      fps: 5,
    });

    function succes(result) {
      newScanner.clear().then(() => {
        setIsScanning(false);
        setScanResult(result);
      }).catch(error => {
        console.log("Scanner clear error:", error);
      });
    }

    function error(err) {
      console.warn(err);
    }

    newScanner.render(succes, error);
    scannerRef.current = newScanner;
    setIsScanning(true);
  }, [cleanUpScanner, isLoaded]);

  // Inisialisasi scanner - hanya setelah reload selesai
  useEffect(() => {
    if (isLoaded) {
      startScanner();
    }
  }, [isLoaded, startScanner]);

  // Fungsi untuk scan ulang
  const handleRescan = () => {
    setScanResult(null);
    setIsScanning(true);
    setTimeout(() => {
      startScanner();
    }, 100);
  };

  // Fungsi untuk kembali - SELALU ke beranda
  const handleBack = () => {
    handleNavigationAway('/');
  };

  // Tampilkan loading sampai reload selesai
  if (!isLoaded) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Mempersiapkan scanner...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 bg-white shadow-xl rounded-2xl">
          
          {/* Header */}
          <div className="text-center mb-8 pt-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Scan Tiket - Event {eventId}
            </h1>
            <p className="text-gray-600">
              Arahkan kamera ke QR code pada tiket untuk check-in
            </p>
          </div>

          {/* Container untuk scanner */}
          <div id="scanner-container" className="text-center">
            {isScanning && !scanResult && (
              <div>
                <div id="reader" className="mx-auto max-w-md"></div>
                <p className="text-gray-600 mt-4">Scanning QR code...</p>
              </div>
            )}
          </div>

          {scanResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Hasil Scan String */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Hasil Scan:
                </h3>
                <code className="bg-white p-3 rounded border text-sm break-all">
                  {scanResult}
                </code>
              </div>

              {/* Data Tiket */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="text-center mb-4">
                  <div className="text-green-500 text-4xl mb-2">✅</div>
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    Scan Berhasil!
                  </h2>
                  <p className="text-green-600">
                    Tiket berhasil divalidasi dan check-in
                  </p>
                </div>

                {/* Detail Tiket */}
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    Detail Tiket
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-500">Ticket ID</label>
                        <p className="font-semibold">{dummyTicketData.ticketId}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Nama Event</label>
                        <p className="font-semibold">{dummyTicketData.eventName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Tipe Tiket</label>
                        <p className="font-semibold">{dummyTicketData.ticketType}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Harga</label>
                        <p className="font-semibold">{dummyTicketData.price}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-500">Nama Pembeli</label>
                        <p className="font-semibold">{dummyTicketData.buyerName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Tanggal Pembelian</label>
                        <p className="font-semibold">{dummyTicketData.purchaseDate}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Status</label>
                        <p className="font-semibold text-green-600">{dummyTicketData.status}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Waktu Check-in</label>
                        <p className="font-semibold">{dummyTicketData.checkInTime}</p>
                      </div>
                    </div>
                  </div>

                  {dummyTicketData.seat && (
                    <div className="mt-4 text-center">
                      <label className="text-sm text-gray-500">Nomor Kursi</label>
                      <p className="text-2xl font-bold text-blue-600">{dummyTicketData.seat}</p>
                    </div>
                  )}
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRescan}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    🔄 Scan Tiket Lain
                  </motion.button>
                  
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="text-center text-gray-500 text-sm mt-8">
            <p>Pastikan QR code dalam kondisi baik dan terlihat jelas oleh kamera</p>
          </div>
        </div>
      </div>
    </div>
  );
}