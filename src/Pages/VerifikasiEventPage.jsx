import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { eventAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";
import { Search, Filter, Calendar, X, Eye, CheckCircle, XCircle, RefreshCw, FileText } from "lucide-react";

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
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mt-32">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Verifikasi Event</h1>
                <p className="text-gray-600 mt-2">
                  Total: {events.length} event • Ditampilkan: {filteredEvents.length} event
                </p>
              </div>
              
              <div className="flex items-center gap-3 mt-4 md:mt-0">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    <X size={16} />
                    Hapus Filter
                  </button>
                )}
                
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Event Menunggu Verifikasi</p>
                  <p className="text-3xl font-bold mt-1">{events.length} Event</p>
                  <p className="text-blue-100 text-sm mt-2">
                    {filteredEvents.length} event sesuai dengan filter yang diterapkan
                  </p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <FileText size={32} className="text-blue-700" />
                </div>
              </div>
            </div>

            {/* Panel Filter dan Pencarian */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Filter & Pencarian</h3>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter size={18} />
                  {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
                </button>
              </div>

              {showFilters && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
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
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Filter aktif: 
                        {searchTerm && ` Nama: "${searchTerm}"`}
                        {dateFilter && ` Tanggal: ${new Date(dateFilter).toLocaleDateString("id-ID")}`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Daftar Event */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Memuat daftar event...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
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
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Hapus Semua Filter
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.event_id}
                    className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
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
                        <button
                          onClick={() => handleViewDetails(event)}
                          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-lg transition-colors font-medium min-w-[120px] justify-center"
                        >
                          <Eye size={16} />
                          Detail
                        </button>
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2.5 rounded-lg transition-colors font-medium min-w-[120px] justify-center"
                        >
                          <CheckCircle size={16} />
                          Verifikasi
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer dengan informasi pagination */}
            {filteredEvents.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500 pt-4 border-t border-gray-200">
                <div>
                  Menampilkan <span className="font-medium">{filteredEvents.length}</span> dari{" "}
                  <span className="font-medium">{events.length}</span> event
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Tampilkan Semua Event
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Verifikasi */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Verifikasi Event</h3>
              <p className="text-gray-600 text-sm mt-1">Tinjau detail event sebelum menyetujui atau menolak</p>
            </div>

            {/* Content Modal */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Nama Event</p>
                  <p className="text-gray-900">{selectedEvent.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Organizer</p>
                  <p className="text-gray-900">{selectedEvent.owner?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Kategori</p>
                  <p className="text-gray-900">{selectedEvent.category} • {selectedEvent.child_category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Tanggal</p>
                  <p className="text-gray-900">
                    {new Date(selectedEvent.date_start).toLocaleDateString('id-ID')} - {" "}
                    {new Date(selectedEvent.date_end).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Lokasi</p>
                  <p className="text-gray-900">{selectedEvent.location}, {selectedEvent.city}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Deskripsi</p>
                  <div className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {renderTextWithNewlines(selectedEvent.description)}
                  </div>
                </div>
              </div>

              <div>
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
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    setApprovalComment("");
                  }}
                  className="px-5 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors font-medium"
                >
                  Batal
                </button>
                <button 
                  onClick={() => handleVerifyEvent(selectedEvent.event_id, "rejected")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                >
                  <XCircle size={16} />
                  Tolak Event
                </button>
                <button 
                  onClick={() => handleVerifyEvent(selectedEvent.event_id, "approved")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
                >
                  <CheckCircle size={16} />
                  Setujui Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}