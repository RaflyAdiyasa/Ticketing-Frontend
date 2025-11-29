// Pages/CheckinTiketPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";
import { ticketAPI, eventAPI } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  QrCode,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Home,
  Ticket,
  Calendar,
  MapPin,
  Clock,
  User,
  AlertCircle,
  Loader2,
  ScanLine,
  ChevronLeft,
  Tag,
  CreditCard,
  Building2,
  Shield,
  TicketCheck,
  Users,
  Info
} from "lucide-react";

export default function CheckinTiketPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  // States
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState(null); // 'success', 'error', 'already_used'
  const [errorMessage, setErrorMessage] = useState("");
  const [scanCount, setScanCount] = useState(0);
  const [user, setUser] = useState(null);
  
  const scannerRef = useRef(null);
  const { notification, showNotification, hideNotification } = useNotification();

  // Check user login and role
  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Hanya organizer dan admin yang bisa akses halaman ini
      if (parsedUser.role !== "organizer" && parsedUser.role !== "admin") {
        showNotification("Anda tidak memiliki akses ke halaman ini", "Akses Ditolak", "error");
        navigate("/");
        return;
      }
    } else {
      showNotification("Silakan login terlebih dahulu", "Akses Ditolak", "warning");
      navigate("/login");
      return;
    }
    setIsLoaded(true);
  }, [navigate, showNotification]);

  // Fetch event data
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId || !isLoaded) return;
      
      try {
        const response = await eventAPI.getEvent(eventId);
        setEventData(response.data);
      } catch (error) {
        console.error("Error fetching event:", error);
        showNotification("Gagal memuat data event", "Error", "error");
      }
    };
    
    fetchEventData();
  }, [eventId, isLoaded, showNotification]);

  // Clean function untuk membersihkan scanner
  const cleanUpScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.log("Scanner cleanup error:", error);
      });
      scannerRef.current = null;
    }
  }, []);

  // Fungsi untuk memulai scanner
  const startScanner = useCallback(() => {
    if (!isLoaded) return;

    cleanUpScanner();

    // Pastikan container ada
    const containerElement = document.getElementById('scanner-container');
    if (!containerElement) return;

    let readerElement = document.getElementById('reader');
    if (!readerElement) {
      readerElement = document.createElement('div');
      readerElement.id = 'reader';
      containerElement.appendChild(readerElement);
    }

    const newScanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 300, height: 300 },
      fps: 10,
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
      defaultZoomValueIfSupported: 2
    });

    async function onScanSuccess(decodedText) {
      // Prevent multiple scans
      if (isProcessing) return;
      
      setIsProcessing(true);
      setScanResult(decodedText);
      
      // Clear scanner
      await newScanner.clear().catch(console.log);
      setIsScanning(false);
      
      // Process check-in
      await processCheckIn(decodedText);
    }

    function onScanError(err) {
      // Ignore scan errors (normal when no QR code is visible)
    }

    newScanner.render(onScanSuccess, onScanError);
    scannerRef.current = newScanner;
    setIsScanning(true);
  }, [cleanUpScanner, isLoaded, isProcessing]);

  // Process check-in dengan API
  const processCheckIn = async (ticketCode) => {
    try {
      setCheckInStatus(null);
      setErrorMessage("");
      
      const response = await ticketAPI.checkInTicket(eventId, ticketCode);
      
      if (response.data) {
        setTicketData(response.data.ticket);
        setCheckInStatus('success');
        setScanCount(prev => prev + 1);
        showNotification("Tiket berhasil di check-in!", "Check-in Berhasil", "success");
      }
    } catch (error) {
      console.error("Check-in error:", error);
      
      const errorMsg = error.response?.data?.error || "Terjadi kesalahan saat check-in";
      setErrorMessage(errorMsg);
      
      if (errorMsg.includes("already used") || errorMsg.includes("sudah digunakan")) {
        setCheckInStatus('already_used');
        showNotification("Tiket sudah pernah digunakan", "Check-in Gagal", "warning");
      } else if (errorMsg.includes("not found") || errorMsg.includes("tidak ditemukan") || errorMsg.includes("invalid")) {
        setCheckInStatus('error');
        showNotification("Tiket tidak ditemukan atau tidak valid", "Check-in Gagal", "error");
      } else if (errorMsg.includes("not active")) {
        setCheckInStatus('error');
        showNotification("Tiket tidak aktif", "Check-in Gagal", "error");
      } else {
        setCheckInStatus('error');
        showNotification(errorMsg, "Check-in Gagal", "error");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Inisialisasi scanner
  useEffect(() => {
    if (isLoaded && user) {
      startScanner();
    }
    
    return () => {
      cleanUpScanner();
    };
  }, [isLoaded, user, startScanner, cleanUpScanner]);

  // Fungsi untuk scan ulang
  const handleRescan = () => {
    setScanResult(null);
    setTicketData(null);
    setCheckInStatus(null);
    setErrorMessage("");
    setIsScanning(true);
    setIsProcessing(false);
    
    setTimeout(() => {
      startScanner();
    }, 100);
  };

  // Fungsi untuk kembali
  const handleBack = () => {
    cleanUpScanner();
    navigate(-1);
  };

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format waktu
  const formatTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format rupiah
  const formatRupiah = (number) => {
    if (!number || number === 0) return "GRATIS";
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  // Loading state
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] pt-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
          >
            <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
            <p className="mt-4 text-gray-600 font-medium">Mempersiapkan scanner...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mt-15"
          >
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <TicketCheck className="w-8 h-8 text-blue-600" />
                  Check-in Tiket
                </h1>
                <p className="text-gray-600 mt-2">
                  {eventData?.name || `Event ID: ${eventId}`}
                </p>
              </div>
              
              <motion.button
                onClick={handleBack}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg transition-colors font-medium"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft size={18} />
                Kembali
              </motion.button>
            </motion.div>

            {/* Event Info Card */}
            {eventData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200"
              >
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <Info size={18} className="text-blue-600" />
                  Informasi Event
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tanggal</p>
                      <p className="font-medium text-gray-900">{formatDate(eventData.date_start)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Waktu</p>
                      <p className="font-medium text-gray-900">{formatTime(eventData.date_start)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Venue</p>
                      <p className="font-medium text-gray-900">{eventData.venue || eventData.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Lokasi</p>
                      <p className="font-medium text-gray-900">{eventData.district}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
            >
              {/* Scanner Section */}
              <AnimatePresence mode="wait">
                {isScanning && !scanResult && (
                  <motion.div
                    key="scanner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6"
                  >
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <ScanLine className="w-8 h-8 text-blue-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Scan QR Code Tiket</h2>
                      <p className="text-gray-500 mt-2">
                        Arahkan kamera ke QR code pada tiket pengunjung
                      </p>
                    </div>
                    
                    {/* Scanner Container */}
                    <div id="scanner-container" className="max-w-md mx-auto">
                      <div id="reader" className="rounded-xl overflow-hidden"></div>
                    </div>
                    
                    {/* Instructions */}
                    <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Petunjuk Scanning
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Pastikan QR code terlihat jelas dan tidak rusak</li>
                        <li>• Posisikan QR code di tengah area scanning</li>
                        <li>• Jaga jarak optimal sekitar 15-30 cm dari kamera</li>
                        <li>• Pastikan pencahayaan cukup</li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* Processing State */}
                {isProcessing && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-12 text-center"
                  >
                    <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
                    <p className="mt-4 text-lg font-medium text-gray-700">Memproses check-in...</p>
                    <p className="text-gray-500 mt-2">Mohon tunggu sebentar</p>
                  </motion.div>
                )}

                {/* Result Section */}
                {!isScanning && !isProcessing && scanResult && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-6"
                  >
                    {/* Success State */}
                    {checkInStatus === 'success' && (
                      <div className="space-y-6">
                        {/* Success Header */}
                        <motion.div 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-center py-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
                          >
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                          </motion.div>
                          <h2 className="text-2xl font-bold text-green-800">Check-in Berhasil!</h2>
                          <p className="text-green-600 mt-2">Tiket telah divalidasi dan pengunjung dapat masuk</p>
                        </motion.div>

                        {/* Ticket Details */}
                        {ticketData && (
                          <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <Ticket className="w-5 h-5 text-blue-600" />
                              Detail Tiket
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <DetailItem
                                icon={<QrCode className="w-5 h-5 text-gray-500" />}
                                label="Kode Tiket"
                                value={ticketData.code}
                              />
                              <DetailItem
                                icon={<Tag className="w-5 h-5 text-gray-500" />}
                                label="ID Tiket"
                                value={ticketData.ticket_id?.slice(0, 12) + "..."}
                              />
                              <DetailItem
                                icon={<Shield className="w-5 h-5 text-gray-500" />}
                                label="Status"
                                value={
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Sudah Check-in
                                  </span>
                                }
                              />
                              <DetailItem
                                icon={<Clock className="w-5 h-5 text-gray-500" />}
                                label="Waktu Check-in"
                                value={new Date().toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              />
                            </div>

                            {ticketData.tag && (
                              <div className="pt-4 border-t border-gray-200">
                                <DetailItem
                                  icon={<User className="w-5 h-5 text-gray-500" />}
                                  label="Tag Pemilik"
                                  value={ticketData.tag}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Already Used State */}
                    {checkInStatus === 'already_used' && (
                      <div className="space-y-6">
                        <motion.div 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-center py-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4"
                          >
                            <AlertCircle className="w-10 h-10 text-amber-600" />
                          </motion.div>
                          <h2 className="text-2xl font-bold text-amber-800">Tiket Sudah Digunakan</h2>
                          <p className="text-amber-600 mt-2">Tiket ini sudah pernah di check-in sebelumnya</p>
                        </motion.div>

                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-amber-800">Perhatian</h4>
                              <p className="text-sm text-amber-700 mt-1">
                                Tiket dengan kode <span className="font-mono font-bold">{scanResult}</span> sudah digunakan. 
                                Mohon periksa kembali atau hubungi panitia jika ada masalah.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error State */}
                    {checkInStatus === 'error' && (
                      <div className="space-y-6">
                        <motion.div 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-center py-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border border-red-200"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4"
                          >
                            <XCircle className="w-10 h-10 text-red-600" />
                          </motion.div>
                          <h2 className="text-2xl font-bold text-red-800">Check-in Gagal</h2>
                          <p className="text-red-600 mt-2">{errorMessage || "Tiket tidak valid atau tidak ditemukan"}</p>
                        </motion.div>

                        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                          <div className="flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-red-800">Kemungkinan Penyebab</h4>
                              <ul className="text-sm text-red-700 mt-1 space-y-1">
                                <li>• QR code tidak terbaca dengan benar</li>
                                <li>• Tiket bukan untuk event ini</li>
                                <li>• Tiket sudah tidak aktif atau expired</li>
                                <li>• Kode tiket tidak valid</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Kode yang di-scan:</span>{" "}
                            <span className="font-mono bg-gray-200 px-2 py-1 rounded">{scanResult}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRescan}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Scan Tiket Lain
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBack}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                      >
                        <Home className="w-5 h-5" />
                        Kembali ke Dashboard
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Quick Stats */}
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <StatCard
                  icon={<Users className="w-6 h-6" />}
                  label="Total Attendant"
                  value={eventData?.total_attendant || 0}
                  color="blue"
                />
                <StatCard
                  icon={<Ticket className="w-6 h-6" />}
                  label="Tiket Terjual"
                  value={eventData?.total_tickets_sold || 0}
                  color="green"
                />
                <StatCard
                  icon={<TicketCheck className="w-6 h-6" />}
                  label="Check-in Sesi Ini"
                  value={scanCount}
                  color="purple"
                />
                <StatCard
                  icon={<CreditCard className="w-6 h-6" />}
                  label="Total Sales"
                  value={formatRupiah(eventData?.total_sales || 0)}
                  color="amber"
                  isSmallText
                />
              </motion.div>
            )}

            {/* Footer Tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 text-center text-sm text-gray-500"
            >
              <p>
                Pastikan QR code dalam kondisi baik dan terlihat jelas oleh kamera.
                <br />
                Jika mengalami masalah, coba refresh halaman atau gunakan perangkat lain.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Custom Styles for Scanner */}
      <style>{`
        #reader {
          border: none !important;
          border-radius: 12px;
          overflow: hidden;
        }
        #reader video {
          border-radius: 12px;
        }
        #reader__scan_region {
          background: transparent !important;
        }
        #reader__scan_region video {
          border-radius: 8px;
        }
        #reader__dashboard {
          padding: 12px !important;
        }
        #reader__dashboard_section_swaplink {
          text-decoration: none !important;
          color: #2563eb !important;
          font-weight: 600;
        }
        #html5-qrcode-button-camera-permission,
        #html5-qrcode-button-camera-start,
        #html5-qrcode-button-camera-stop {
          background: #2563eb !important;
          border: none !important;
          padding: 12px 24px !important;
          border-radius: 8px !important;
          color: white !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }
        #html5-qrcode-button-camera-permission:hover,
        #html5-qrcode-button-camera-start:hover,
        #html5-qrcode-button-camera-stop:hover {
          background: #1d4ed8 !important;
        }
        #html5-qrcode-anchor-scan-type-change {
          color: #2563eb !important;
          text-decoration: none !important;
          font-weight: 500 !important;
        }
        #reader__filescan_input {
          padding: 8px !important;
        }
        #reader select {
          padding: 8px 12px !important;
          border-radius: 6px !important;
          border: 1px solid #d1d5db !important;
        }
      `}</style>
    </div>
  );
}

// Detail Item Component
function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color, isSmallText = false }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200"
  };

  const iconColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    amber: "text-amber-600"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`${colorClasses[color]} border rounded-xl p-4 transition-all`}
    >
      <div className={`${iconColorClasses[color]} mb-2`}>{icon}</div>
      <p className={`font-bold ${isSmallText ? 'text-sm' : 'text-2xl'}`}>{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </motion.div>
  );
}