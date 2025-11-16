import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { eventAPI } from "../services/api";

export default function EventSayaPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getMyEvents();
      setEvents(response.data.events || []);
    } catch (err) {
      console.error("Error fetching my events:", err);
      setError("Gagal memuat event saya");
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Pending",
      rejected: "Ditolak",
      approved: "Diterima",
      completed: "Selesai",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDetail = (eventId) => {
    navigate(`/detailEvent/${eventId}`);
  };

  const handleEdit = (eventId) => {
    navigate(`/detailEvent/${eventId}`);
  };

  const handleLaporan = (eventId) => {
    navigate(`/laporan/${eventId}`);
  };

  const handleScan = (eventId) => {
    // Navigate to scan page
    console.log("Buka scan untuk event:", eventId);
    // navigate(`/scan/${eventId}`);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center pt-36">
          <div className="text-lg">Memuat event saya...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center pt-36">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6">Event Saya</h2>

          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada event yang dibuat
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    <th className="p-4 border">Nama Event</th>
                    <th className="p-4 border">Lokasi</th>
                    <th className="p-4 border">Tanggal</th>
                    <th className="p-4 border">Status</th>
                    <th className="p-4 border w-40 text-center">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((event) => (
                    <tr key={event.event_id} className="hover:bg-gray-50">
                      <td className="p-4 border text-sm font-medium">
                        {event.name}
                      </td>
                      <td className="p-4 border text-sm">
                        {event.location}, {event.city}
                      </td>
                      <td className="p-4 border text-sm">
                        {new Date(event.date_start).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-4 border text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            event.status
                          )}`}
                        >
                          {getStatusText(event.status)}
                        </span>
                        {event.approval_comment &&
                          event.status === "rejected" && (
                            <div className="text-xs text-red-600 mt-1">
                              Alasan: {event.approval_comment}
                            </div>
                          )}
                      </td>

                      <td className="p-4 border text-sm">
                        <div className="flex gap-2 justify-center">
                          {/* Tombol Rincian - selalu ada */}
                          <button
                            onClick={() => handleDetail(event.event_id)}
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-xs"
                          >
                            Rincian
                          </button>

                          {/* Tombol Edit - hanya untuk status pending dan rejected */}
                          {(event.status === "pending" ||
                            event.status === "rejected") && (
                            <button
                              onClick={() => handleEdit(event.event_id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs"
                            >
                              Edit
                            </button>
                          )}

                          {/* Tombol Laporan - untuk status approved dan completed */}
                          {(event.status === "approved" ||
                            event.status === "completed") && (
                            <button
                              onClick={() => handleLaporan(event.event_id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs"
                            >
                              Laporan
                            </button>
                          )}

                          {/* Tombol Scan - hanya untuk status approved */}
                          {event.status === "approved" && (
                            <button
                              onClick={() => handleScan(event.event_id)}
                              className="px-3 py-1 bg-gray-800 hover:bg-black text-white rounded-md text-xs"
                            >
                              Scan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
