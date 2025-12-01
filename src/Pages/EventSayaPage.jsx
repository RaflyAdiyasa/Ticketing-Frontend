import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { eventAPI } from "../services/api";
import { Search, Filter, Calendar, X, Eye, Pencil, BarChart3, QrCode, Folder, RefreshCw, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = {
  Hiburan: [
    "Musik",
    "Konser",
    "Festival",
    "Stand Up Comedy",
    "Film",
    "Teater",
    "K-Pop",
    "Dance Performance",
  ],
  Teknologi: [
    "Konferensi Teknologi",
    "Workshop IT",
    "Startup",
    "Software Development",
    "Artificial Intelligence",
    "Data Science",
    "Cybersecurity",
    "Gaming & Esports",
  ],
  Edukasi: [
    "Seminar",
    "Workshop",
    "Pelatihan",
    "Webinar",
    "Bootcamp",
    "Kelas Online",
    "Literasi Digital",
    "Kelas Bisnis",
  ],
  Olahraga: [
    "Marathon",
    "Fun Run",
    "Sepak Bola",
    "Badminton",
    "Gym & Fitness",
    "Yoga",
    "Esport",
    "Cycling Event",
  ],
  "Bisnis & Profesional": [
    "Konferensi Bisnis",
    "Networking",
    "Karir",
    "Entrepreneurship",
    "Leadership",
    "Startup Meetup",
    "Investor & Pitching",
  ],
  "Seni & Budaya": [
    "Pameran Seni",
    "Pentas Budaya",
    "Fotografi",
    "Seni Rupa",
    "Crafting",
    "Pameran Museum",
    "Fashion Show",
  ],
  Komunitas: [
    "Kegiatan Relawan",
    "Kegiatan Sosial",
    "Gathering Komunitas",
    "Komunitas Hobi",
    "Meetup",
    "Charity Event",
  ],
  Kuliner: [
    "Festival Kuliner",
    "Food Tasting",
    "Workshop Memasak",
    "Street Food Event",
  ],
  Kesehatan: [
    "Seminar Kesehatan",
    "Medical Check Event",
    "Workshop Kesehatan Mental",
    "Donor Darah",
  ],
  "Agama & Spiritual": [
    "Kajian",
    "Retreat",
    "Pengajian",
    "Event Keagamaan",
    "Meditasi",
  ],
  "Travel & Outdoor": [
    "Camping",
    "Hiking",
    "Trip Wisata",
    "Outdoor Gathering",
    "Photography Trip",
  ],
  "Keluarga & Anak": [
    "Family Gathering",
    "Event Anak",
    "Workshop Parenting",
    "Pentas Anak",
  ],
  "Fashion & Beauty": [
    "Fashion Expo",
    "Beauty Class",
    "Makeup Workshop",
    "Brand Launching",
  ],
};

const DISTRICTS = [
  "Tegalrejo",
  "Jetis",
  "Gondokusuman",
  "Danurejan",
  "Gedongtengen",
  "Ngampilan",
  "Wirobrajan",
  "Mantrijeron",
  "Kraton",
  "Gondomanan",
  "Pakualaman",
  "Mergangsan",
  "Umbulharjo",
  "Kotagede",
];

const CATEGORY_COLORS = {
  Hiburan: "bg-purple-500",
  Teknologi: "bg-blue-500",
  Edukasi: "bg-cyan-500",
  Olahraga: "bg-green-500",
  "Bisnis & Profesional": "bg-amber-500",
  "Seni & Budaya": "bg-pink-500",
  Komunitas: "bg-indigo-500",
  Kuliner: "bg-orange-500",
  Kesehatan: "bg-red-500",
  "Agama & Spiritual": "bg-teal-500",
  "Travel & Outdoor": "bg-emerald-500",
  "Keluarga & Anak": "bg-rose-500",
  "Fashion & Beauty": "bg-fuchsia-500",
  Lainnya: "bg-gray-500",
};

export default function EventSayaPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const getParentCategory = (category) => {
    if (!category) return "Lainnya";

    if (CATEGORIES[category]) {
      return category;
    }

    for (const [parent, children] of Object.entries(CATEGORIES)) {
      if (children.includes(category)) {
        return parent;
      }
    }

    return "Lainnya";
  };

  const getCategoryColor = (category) => {
    const parentCategory = getParentCategory(category);
    return CATEGORY_COLORS[parentCategory] || CATEGORY_COLORS["Lainnya"];
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, searchTerm, statusFilter, categoryFilter, districtFilter, dateFilter]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getMyEvents();
      setEvents(response.data.events || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching my events:", err);
      setError("Gagal memuat event saya");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMyEvents();
  };

  const applyFilters = () => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    if (categoryFilter) {
      const filteredByParentCategory = filtered.filter(event => getParentCategory(event.category) === categoryFilter);
      filtered = filteredByParentCategory;
    }

    if (districtFilter) {
      filtered = filtered.filter(event => event.district === districtFilter);
    }

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
    setCategoryFilter("");
    setDistrictFilter("");
    setDateFilter("");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || categoryFilter || districtFilter || dateFilter;

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Ditinjau",
      rejected: "Ditolak",
      approved: "Diterima",
      active: "Berlangsung",
      endeed: "Selesai",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "rejected":
        return "bg-red-50 text-red-700 border border-red-200";
      case "approved":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "active":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "ended":
        return "bg-slate-100 text-slate-700 border border-slate-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen py-8 flex items-center justify-center pt-36">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-lg text-gray-600">Memuat event saya...</div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center pt-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-red-600 text-lg font-semibold mb-2">{error}</div>
            <motion.button
              onClick={fetchMyEvents}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Coba Lagi
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mt-32"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Event Saya</h1>
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
                  disabled={refreshing}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50"
                  whileHover={{ scale: refreshing ? 1 : 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                  {refreshing ? "Memperbarui..." : "Refresh"}
                </motion.button>
              </div>
            </motion.div>

            <motion.div 
              className="pb-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={itemVariants}
                className="bg-gray-50 rounded-xl p-6 mb-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Filter & Pencarian</h3>

                  <div className="flex items-center gap-3">
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
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Filter size={18} />
                      {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
                    </motion.button>
                  </div>
                </div>

                <motion.div
                  className="relative mb-4"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari nama event atau lokasi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </motion.div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="all">Semua Status</option>
                            <option value="pending">Menunggu Review</option>
                            <option value="approved">Diterima</option>
                            <option value="rejected">Ditolak</option>
                            <option value="ended">Selesai</option>
                          </select>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kategori
                          </label>
                          <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="">Semua Kategori</option>
                            {Object.keys(CATEGORIES).map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lokasi
                          </label>
                          <div className="relative">
                            <Building2
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <select
                              value={districtFilter}
                              onChange={(e) => setDistrictFilter(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              <option value="">Semua Kecamatan</option>
                              {DISTRICTS.map((district) => (
                                <option key={district} value={district}>
                                  {district}
                                </option>
                              ))}
                            </select>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tanggal
                          </label>
                          <div className="relative">
                            <Calendar
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <input
                              type="date"
                              value={dateFilter}
                              onChange={(e) => setDateFilter(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                            />
                          </div>
                        </motion.div>
                      </div>

                      {hasActiveFilters && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <p className="text-sm text-blue-800">
                            Filter aktif:
                            {searchTerm && ` Pencarian: "${searchTerm}"`}
                            {statusFilter !== "all" && ` Status: ${getStatusText(statusFilter)}`}
                            {categoryFilter && ` Kategori: ${categoryFilter}`}
                            {districtFilter && ` Kecamatan: ${districtFilter}`}
                            {dateFilter && ` Tanggal: ${new Date(dateFilter).toLocaleDateString("id-ID")}`}
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {filteredEvents.length === 0 ? (
                <motion.div 
                  variants={itemVariants}
                  className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl"
                >
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
                    <motion.button
                      onClick={clearFilters}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Hapus Semua Filter
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  variants={itemVariants}
                  className="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
                >
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
                      {filteredEvents.map((event, index) => (
                        <motion.tr 
                          key={event.event_id} 
                          className="hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <td className="p-4">
                            <div className="flex flex-col">
                              <h3 className="font-semibold text-gray-900 text-lg">{event.name}</h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <motion.span
                                  className={`${getCategoryColor(event.category)} text-white text-xs px-2 py-1 rounded-full`}
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                  {getParentCategory(event.category)}
                                </motion.span>
                                {event.category !== getParentCategory(event.category) && event.category && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {event.category}
                                  </span>
                                )}
                                {event.child_category && (
                                  <>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-400">{event.child_category}</span>
                                  </>
                                )}
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
                              <motion.button
                                onClick={() => handleDetail(event.event_id)}
                                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[100px] justify-center"
                                title="Lihat rincian event"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Eye size={16} />
                                Rincian
                              </motion.button>

                              {(event.status === "pending" || event.status === "rejected") && (
                                <motion.button
                                  onClick={() => handleEdit(event.event_id)}
                                  className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[100px] justify-center"
                                  title="Edit event"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Pencil size={16} />
                                  Edit
                                </motion.button>
                              )}

                              {(event.status === "approved" || event.status === "ended" || event.status === "active") && (
                                <motion.button
                                  onClick={() => handleLaporan(event.event_id)}
                                  className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[100px] justify-center"
                                  title="Lihat laporan"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <BarChart3 size={16} />
                                  Laporan
                                </motion.button>
                              )}

                              {event.status === "approved" && (
                                <motion.button
                                  onClick={() => handleScan(event.event_id)}
                                  className="flex items-center gap-2 bg-gray-800 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[100px] justify-center"
                                  title="Scan tiket"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <QrCode size={16} />
                                  Scan
                                </motion.button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {filteredEvents.length > 0 && (
                <motion.div 
                  variants={itemVariants}
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}