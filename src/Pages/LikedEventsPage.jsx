import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { eventAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";
import {
  Heart,
  Calendar,
  MapPin,
  ArrowRight,
  RefreshCw,
  Clock,
  Building2,
  Search,
  X,
  Sparkles,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Category colors
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

export default function LikedEventsPage() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();

  const [likedEvents, setLikedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Check login status
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setIsLoggedIn(true);
  }, [navigate]);

  // Fetch liked events
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchLikedEvents();
  }, [isLoggedIn]);

  const fetchLikedEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getMyLikedEvents();
      setLikedEvents(response.data?.liked_event || []);
    } catch (error) {
      console.error("Error fetching liked events:", error);
      showNotification("Gagal memuat event yang disukai", "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle unlike event
  const handleUnlikeEvent = async (eventId, e) => {
    e.stopPropagation();

    try {
      await eventAPI.likeEvent(eventId);
      setLikedEvents((prev) =>
        prev.filter((event) => event.event_id !== eventId)
      );
      showNotification("Event dihapus dari favorit", "Info", "info");
    } catch (err) {
      console.error("Error unliking event:", err);
      showNotification("Gagal menghapus event dari favorit", "Error", "error");
    }
  };

  const getParentCategory = (category) => {
    if (!category) return "Lainnya";
    if (CATEGORIES[category]) return category;
    for (const [parent, children] of Object.entries(CATEGORIES)) {
      if (children.includes(category)) return parent;
    }
    return "Lainnya";
  };

  const getCategoryColor = (category) => {
    const parentCategory = getParentCategory(category);
    return CATEGORY_COLORS[parentCategory] || CATEGORY_COLORS["Lainnya"];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return "-";
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    const startStr = formatDate(startDate);

    if (start.toDateString() === end.toDateString()) {
      return startStr;
    }

    const endStr = formatDate(endDate);
    return `${startStr} - ${endStr}`;
  };

  const handleEventClick = (eventId) => {
    navigate(`/detailEvent/${eventId}`);
  };

  // Process events for filtering and sorting
  const processedEvents = useMemo(() => {
    return likedEvents.map(event => ({
      ...event,
      parentCategory: getParentCategory(event.category),
      categoryColor: getCategoryColor(event.category),
      formattedDate: formatDateRange(event.date_start, event.date_end),
    }));
  }, [likedEvents]);

  // Parent categories for dropdown
  const parentCategoriesForFilter = Object.keys(CATEGORIES);

  // Filtered events
  const filteredEvents = useMemo(() => {
    let filtered = [...processedEvents];

    if (selectedCategory) {
      filtered = filtered.filter(event => event.parentCategory === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.name?.toLowerCase().includes(term) ||
        event.venue?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term) ||
        event.category?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [processedEvents, selectedCategory, searchTerm]);

  // Sorted events
  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents];
    
    sorted.sort((a, b) => {
      let compareResult = 0;
      switch (sortBy) {
        case "date":
          compareResult = new Date(a.date_start || 0) - new Date(b.date_start || 0);
          break;
        case "name":
          compareResult = (a.name || "").localeCompare(b.name || "");
          break;
        case "likes":
          compareResult = (a.total_likes || 0) - (b.total_likes || 0);
          break;
        default:
          compareResult = new Date(a.date_start || 0) - new Date(b.date_start || 0);
      }
      return sortOrder === "desc" ? -compareResult : compareResult;
    });

    return sorted;
  }, [filteredEvents, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSortBy("date");
    setSortOrder("desc");
    showNotification("Filter berhasil direset", "Info", "info");
  };

  const hasActiveFilters = searchTerm || selectedCategory;

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"
            />
            <p className="mt-6 text-slate-600 font-medium">Memuat event favorit Anda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <Navbar />
      
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
                  Event yang Disukai
                </h1>
                <p className="text-gray-600 mt-2">
                  Kelola semua event favorit Anda di satu tempat
                </p>
              </div>
              
              <div className="flex gap-3">
                <motion.button
                  onClick={() => navigate('/cariEvent')}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles size={18} className="inline mr-2" />
                  Jelajahi Event
                </motion.button>
                
                <motion.button
                  onClick={fetchLikedEvents}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                  Refresh
                </motion.button>
              </div>
            </motion.div>

            {/* Filter Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-50 rounded-xl p-6 mb-8"
            >
              <div className="flex flex-row justify-between items-center gap-3 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Filter & Pencarian
                </h3>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Filter size={18} />
                  <span>{showFilters ? "Sembunyikan" : "Tampilkan"} Filter</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama event, venue, atau kategori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Filter Options */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kategori
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="">Semua Kategori</option>
                          {parentCategoriesForFilter.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Urutkan Berdasarkan
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="date">Tanggal Event</option>
                            <option value="name">Nama Event</option>
                            <option value="likes">Jumlah Like</option>
                          </select>
                          
                          <motion.button
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ArrowUpDown size={20} className={`text-gray-600 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Active Filters */}
                    {hasActiveFilters && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Filter aktif:
                          {searchTerm && ` Pencarian: "${searchTerm}"`}
                          {selectedCategory && ` Kategori: ${selectedCategory}`}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end mt-4"
                >
                  <button 
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    <X size={16} />
                    Hapus Semua Filter
                  </button>
                </motion.div>
              )}
            </motion.div>

            {/* Results Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-6"
            >
              <p className="text-gray-600">
                Menampilkan <span className="font-semibold text-gray-800">{sortedEvents.length}</span> event favorit
                {selectedCategory && ` dalam kategori ${selectedCategory}`}
              </p>
            </motion.div>

            {/* Events List */}
            <div className="space-y-4">
              {sortedEvents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center"
                >
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak Ada Event Ditemukan</h3>
                  <p className="text-gray-600 mb-6">
                    {hasActiveFilters 
                      ? "Tidak ada event yang sesuai dengan filter yang dipilih" 
                      : "Belum ada event yang disukai"
                    }
                  </p>
                  {hasActiveFilters && (
                    <motion.button
                      onClick={clearFilters}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Reset Filter
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                sortedEvents.map((event, index) => (
                  <EventCard
                    key={event.event_id}
                    event={event}
                    index={index}
                    onClick={() => handleEventClick(event.event_id)}
                    onUnlike={(e) => handleUnlikeEvent(event.event_id, e)}
                  />
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Event Card Component (tetap sama)
function EventCard({ event, index, onClick, onUnlike }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{
        scale: 1.01,
        y: -2,
        transition: { type: "spring", stiffness: 400, damping: 17 },
      }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer"
    >
      <div className="flex flex-col md:flex-row">
        {/* Event Image */}
        {event.image && (
          <motion.div
            className="md:w-48 h-32 md:h-auto flex-shrink-0 bg-gray-100"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <img
              src={event.image}
              alt={event.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </motion.div>
        )}

        {/* Event Info */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <motion.span
                  className={`${event.categoryColor} text-white text-xs px-2.5 py-1 rounded-full font-medium`}
                  whileHover={{ scale: 1.05 }}
                >
                  {event.parentCategory}
                </motion.span>
                {event.category !== event.parentCategory && event.category && (
                  <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                    {event.category}
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-3">
                {event.name}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-blue-600 flex-shrink-0" />
                  <span>{event.formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-red-500 flex-shrink-0" />
                  <span className="truncate">
                    {event.venue || event.location || "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-green-600 flex-shrink-0" />
                  <span>
                    {event.date_start
                      ? new Date(event.date_start).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </span>
                </div>
                {event.district && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-purple-600 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>

              {/* Event Stats and Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  {event.total_likes > 0 && (
                    <span className="flex items-center gap-1.5 text-pink-500 text-sm font-medium">
                      <Heart className="w-4 h-4 fill-current" />
                      {event.total_likes}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={onUnlike}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 bg-pink-500 text-white hover:bg-pink-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}