// VerifikasiEventPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { eventAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";
import { Search, Filter, Calendar, X, Eye, CheckCircle, XCircle, RefreshCw, FileText, User, MapPin, Calendar as CalendarIcon, Tag, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VerifikasiEventPage() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [approvalComment, setApprovalComment] = useState("");

  // State untuk filter dan pencarian
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, searchTerm, dateFilter]);

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getPendingEvents();
      const pendingEvents = response.data.filter(event => event.status === "pending");
      setEvents(pendingEvents);
    } catch (error) {
      console.error("Error fetching pending events:", error);
      showNotification("Gagal memuat daftar event pending", "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Filter berdasarkan pencarian nama
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter berdasarkan tanggal
    if (dateFilter) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date_start).toISOString().split('T')[0];
        return eventDate === dateFilter;
      });
    }

    setFilteredEvents(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
  };

  const handleVerifyEvent = async (eventId, status) => {
    try {
      const statusData = {
        status: status,
        approval_comment: approvalComment || `${status === "approved" ? "Event disetujui" : "Event ditolak"} oleh admin`
      };

      await eventAPI.verifyEvent(eventId, statusData);
      
      showNotification(
        `Event berhasil ${status === "approved" ? "disetujui" : "ditolak"}`,
        "Sukses",
        "success"
      );
      
      setSelectedEvent(null);
      setApprovalComment("");
      fetchPendingEvents();
    } catch (error) {
      console.error("Error verifying event:", error);
      showNotification(
        `Gagal ${status === "approved" ? "menyetujui" : "menolak"} event`,
        "Error",
        "error"
      );
    }
  };

  const handleViewDetails = (event) => {
    navigate(`/detailEvent/${event.event_id}`);
  };

  const handleRefresh = () => {
    fetchPendingEvents();
    showNotification("Data event diperbarui", "Sukses", "success");
  };

  // Fungsi untuk menampilkan teks dengan newline
  const renderTextWithNewlines = (text) => {
    if (!text) return "-";
    
    // Split text by newline characters and map to JSX elements
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const hasActiveFilters = searchTerm || dateFilter;

  return (
    <div>
      <Navbar />
      
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mt-32"
          >
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Verifikasi Event</h1>
                <p className="text-gray-600 mt-2">
                  Total: {events.length} event • Ditampilkan: {filteredEvents.length} event
                </p>
              </div>
              
              <div className="flex items-center gap-3 mt-4 md:mt-0">
                {hasActiveFilters && (
                  <motion.button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={16} />
                    Hapus Filter
                  </motion.button>
                )}
                
                <motion.button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={18} />
                  Refresh
                </motion.button>
              </div>
            </motion.div>

            {/* Panel Filter dan Pencarian */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-50 rounded-xl p-6 mb-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Filter & Pencarian</h3>
                
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter size={18} />
                  {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
                </motion.button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pencarian Nama */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Cari Nama Event
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            placeholder="Cari event..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Filter Tanggal */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Filter Tanggal Mulai
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Info Filter Aktif */}
                    {hasActiveFilters && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <p className="text-sm text-blue-800">
                          Filter aktif: 
                          {searchTerm && ` Nama: "${searchTerm}"`}
                          {dateFilter && ` Tanggal: ${new Date(dateFilter).toLocaleDateString("id-ID")}`}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Daftar Event */}
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-12 w-12 border-b-2 border-blue-600"
                />
                <p className="mt-4 text-gray-600">Memuat daftar event...</p>
              </motion.div>
            ) : filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl"
              >
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 font-medium text-lg mb-2">
                  {hasActiveFilters ? "Tidak ada event yang sesuai dengan filter" : "Tidak ada event pending untuk diverifikasi"}
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  {hasActiveFilters 
                    ? "Coba ubah kriteria filter atau hapus filter untuk melihat semua event"
                    : "Semua event telah diverifikasi"
                  }
                </p>
                {hasActiveFilters && (
                  <motion.button
                    onClick={clearFilters}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Hapus Semua Filter
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.event_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between max-w-[35rem] mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-sm font-medium">
                            Menunggu Review
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium text-gray-700">Organizer</p>
                            <p>{event.owner?.name || "Unknown"}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Kategori</p>
                            <p>{event.category} • {event.child_category}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Lokasi</p>
                            <p>{event.location}, {event.city}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Tanggal</p>
                            <p>
                              {new Date(event.date_start).toLocaleDateString('id-ID')} - {" "}
                              {new Date(event.date_end).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        <motion.button
                          onClick={() => handleViewDetails(event)}
                          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-lg transition-colors font-medium min-w-[120px] justify-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye size={16} />
                          Detail
                        </motion.button>
                        <motion.button
                          onClick={() => setSelectedEvent(event)}
                          className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2.5 rounded-lg transition-colors font-medium min-w-[120px] justify-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <CheckCircle size={16} />
                          Verifikasi
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Footer dengan informasi pagination */}
            {filteredEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500 pt-4 border-t border-gray-200"
              >
                <div>
                  Menampilkan <span className="font-medium">{filteredEvents.length}</span> dari{" "}
                  <span className="font-medium">{events.length}</span> event
                </div>
                {hasActiveFilters && (
                  <motion.button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Tampilkan Semua Event
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal Verifikasi - Diperbarui */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                {/* Header Modal */}
                <div className="flex justify-between items-center mb-6">
                  <motion.h3 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl font-bold text-gray-900"
                  >
                    Verifikasi Event
                  </motion.h3>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedEvent(null);
                      setApprovalComment("");
                    }}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                {/* Content Modal */}
                <div className="space-y-6">
                  {/* Informasi Event */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText size={18} />
                      Detail Event
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <User size={14} />
                          Nama Event
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {selectedEvent.name}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <User size={14} />
                          Organizer
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {selectedEvent.owner?.name || "Unknown"}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Tag size={14} />
                          Kategori
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {selectedEvent.category} • {selectedEvent.child_category}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <CalendarIcon size={14} />
                          Tanggal Event
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {new Date(selectedEvent.date_start).toLocaleDateString('id-ID')} - {" "}
                          {new Date(selectedEvent.date_end).toLocaleDateString('id-ID')}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="md:col-span-2"
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <MapPin size={14} />
                          Lokasi
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {selectedEvent.location}, {selectedEvent.city}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="md:col-span-2"
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FileText size={14} />
                          Deskripsi Event
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {renderTextWithNewlines(selectedEvent.description)}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Komentar Verifikasi */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Komentar Verifikasi (Opsional)
                    </label>
                    <textarea
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors whitespace-pre-wrap resize-vertical"
                      rows="3"
                      placeholder="Berikan komentar atau alasan verifikasi..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Komentar akan ditampilkan kepada organizer sebagai feedback
                    </p>
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex gap-3 pt-6 mt-6 border-t border-gray-200"
                >
                  <motion.button
                    onClick={() => {
                      setSelectedEvent(null);
                      setApprovalComment("");
                    }}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Batal
                  </motion.button>
                  <motion.button 
                    onClick={() => handleVerifyEvent(selectedEvent.event_id, "rejected")}
                    className="flex items-center justify-center gap-2 flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <XCircle size={18} />
                    Tolak Event
                  </motion.button>
                  <motion.button 
                    onClick={() => handleVerifyEvent(selectedEvent.event_id, "approved")}
                    className="flex items-center justify-center gap-2 flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckCircle size={18} />
                    Setujui Event
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}