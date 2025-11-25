import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { eventAPI } from "../services/api";
import { Search, Filter, Calendar, X, Eye, Pencil, BarChart3, QrCode, Folder } from "lucide-react";

export default function EventSayaPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // State untuk filter dan pencarian
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, searchTerm, statusFilter, dateFilter]);

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

  const applyFilters = () => {
    let filtered = [...events];

    // Filter berdasarkan pencarian nama
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter berdasarkan status
    if (statusFilter !== "all") {
      filtered = filtered.filter(event => event.status === statusFilter);
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
    setStatusFilter("all");
    setDateFilter("");
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Ditinjau",
      rejected: "Ditolak",
      approved: "Diterima",
      completed: "Selesai",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      case "approved":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const handleDetail = (eventId) => {
    navigate(`/detailEvent/${eventId}`);
  };

  const handleEdit = (eventId) => {
    navigate(`/edit-event/${eventId}`);
  };
  
  const handleLaporan = (eventId) => {
    navigate(`/laporan/${eventId}`);
  };

  const handleScan = (eventId) => {
    navigate(`/scan/${eventId}`);
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || dateFilter;

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-36">
          <div className="text-lg">Memuat event saya...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-36">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mt-32">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Event Saya</h1>
              <p className="text-gray-600 mt-2">
                Total: {events.length} event • Ditampilkan: {filteredEvents.length} event
              </p>
            </div>

            {/* Panel Filter dan Pencarian */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Filter & Pencarian</h3>
                
                <div className="flex items-center gap-3">
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
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Filter size={18} />
                    {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                    {/* Filter Status */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Filter Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="all">Semua Status</option>
                        <option value="pending">Menunggu Review</option>
                        <option value="approved">Diterima</option>
                        <option value="rejected">Ditolak</option>
                        <option value="completed">Selesai</option>
                      </select>
                    </div>

                    {/* Filter Tanggal */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Filter Tanggal
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
                        {statusFilter !== "all" && ` Status: ${getStatusText(statusFilter)}`}
                        {dateFilter && ` Tanggal: ${new Date(dateFilter).toLocaleDateString("id-ID")}`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tabel Event */}
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                <Folder className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 font-medium text-lg mb-2">
                  {hasActiveFilters ? "Tidak ada event yang sesuai dengan filter" : "Belum ada event yang dibuat"}
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  {hasActiveFilters 
                    ? "Coba ubah kriteria filter atau hapus filter untuk melihat semua event"
                    : "Mulai buat event pertama Anda untuk melihatnya di sini"
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
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-sm font-semibold text-gray-700">
                      <th className="p-4 border-b">Event</th>
                      <th className="p-4 border-b">Lokasi & Tanggal</th>
                      <th className="p-4 border-b">Status</th>
                      <th className="p-4 border-b text-center">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {filteredEvents.map((event) => (
                      <tr key={event.event_id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <h3 className="font-semibold text-gray-900 text-lg">{event.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                {event.category}
                              </span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-600">{event.child_category}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-600 line-clamp-2">
                              {event.location}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(event.date_start).toLocaleDateString("id-ID", {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className="flex flex-col gap-2">
                            <span
                              className={`px-3 py-1.5 rounded-full text-sm font-medium w-fit ${getStatusColor(
                                event.status
                              )}`}
                            >
                              {getStatusText(event.status)}
                            </span>
                            {event.approval_comment && event.status === "rejected" && (
                              <div className="text-xs text-red-600 max-w-xs">
                                <span className="font-medium">Alasan:</span> {event.approval_comment}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-2 justify-center min-h-[44px] items-center">
                            {/* Tombol Rincian - selalu ada */}
                            <button
                              onClick={() => handleDetail(event.event_id)}
                              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[100px] justify-center"
                              title="Lihat rincian event"
                            >
                              <Eye size={16} />
                              Rincian
                            </button>

                            {/* Tombol Edit - hanya untuk status pending dan rejected */}
                            {(event.status === "pending" || event.status === "rejected") && (
                              <button
                                onClick={() => handleEdit(event.event_id)}
                                className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[100px] justify-center"
                                title="Edit event"
                              >
                                <Pencil size={16} />
                                Edit
                              </button>
                            )}

                            {/* Tombol Laporan - untuk status approved dan completed */}
                            {(event.status === "approved" || event.status === "completed") && (
                              <button
                                onClick={() => handleLaporan(event.event_id)}
                                className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[100px] justify-center"
                                title="Lihat laporan"
                              >
                                <BarChart3 size={16} />
                                Laporan
                              </button>
                            )}

                            {/* Tombol Scan - hanya untuk status approved */}
                            {event.status === "approved" && (
                              <button
                                onClick={() => handleScan(event.event_id)}
                                className="flex items-center gap-2 bg-gray-800 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[100px] justify-center"
                                title="Scan tiket"
                              >
                                <QrCode size={16} />
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
    </div>
  );
}