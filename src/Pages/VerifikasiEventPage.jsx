import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { eventAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";

export default function VerifikasiEventPage() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [approvalComment, setApprovalComment] = useState("");

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      const response = await eventAPI.getPendingEvents();
      // Filter hanya event dengan status pending
      const pendingEvents = response.data.filter(event => event.status === "pending");
      setEvents(pendingEvents);
    } catch (error) {
      console.error("Error fetching pending events:", error);
      showNotification("Gagal memuat daftar event pending", "Error", "error");
    } finally {
      setLoading(false);
    }
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
      fetchPendingEvents(); // Refresh list
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

  return (
    <div>
      <Navbar />
      
      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6">Verifikasi Event</h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Memuat daftar event...</p>
            </div>
          ) : events.length === 0 ? (
            <p className="text-gray-600">Tidak ada event pending untuk diverifikasi.</p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.event_id}
                  className="p-4 bg-gray-50 rounded-lg shadow flex justify-between items-center"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{event.name}</h3>
                    <p className="text-gray-600 text-sm">
                      Organizer: {event.owner?.name || "Unknown"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Kategori: {event.category} | Lokasi: {event.location}, {event.city}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Tanggal: {new Date(event.date_start).toLocaleDateString('id-ID')} - {new Date(event.date_end).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(event)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Lihat Detail
                    </button>
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Verifikasi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Verifikasi */}
          {selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white max-w-md w-full p-6 rounded-xl shadow-xl">
                <h3 className="text-xl font-bold mb-4">Verifikasi Event</h3>
                <p className="text-gray-700 mb-2">
                  <b>Nama Event:</b> {selectedEvent.name}
                </p>
                <p className="text-gray-700 mb-2">
                  <b>Organizer:</b> {selectedEvent.owner?.name || "Unknown"}
                </p>
                <p className="text-gray-700 mb-4">
                  <b>Deskripsi:</b> {selectedEvent.description}
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Komentar Verifikasi (Opsional):
                  </label>
                  <textarea
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                    rows="3"
                    placeholder="Berikan komentar verifikasi..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedEvent(null);
                      setApprovalComment("");
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => handleVerifyEvent(selectedEvent.event_id, "rejected")}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Tolak
                  </button>
                  <button 
                    onClick={() => handleVerifyEvent(selectedEvent.event_id, "approved")}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    Setujui
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}