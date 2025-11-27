import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { eventAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, Building2, Clock, MapPin, Filter, X, Search, List, RefreshCw} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = {
  "Hiburan": [
    "Musik", "Konser", "Festival", "Stand Up Comedy",
    "Film", "Teater", "K-Pop", "Dance Performance"
  ],
  "Teknologi": [
    "Konferensi Teknologi", "Workshop IT", "Startup",
    "Software Development", "Artificial Intelligence",
    "Data Science", "Cybersecurity", "Gaming & Esports"
  ],
  "Edukasi": [
    "Seminar", "Workshop", "Pelatihan", "Webinar",
    "Bootcamp", "Kelas Online", "Literasi Digital", "Kelas Bisnis"
  ],
  "Olahraga": [
    "Marathon", "Fun Run", "Sepak Bola", "Badminton",
    "Gym & Fitness", "Yoga", "Esport", "Cycling Event"
  ],
  "Bisnis & Profesional": [
    "Konferensi Bisnis", "Networking", "Karir",
    "Entrepreneurship", "Leadership", "Startup Meetup",
    "Investor & Pitching"
  ],
  "Seni & Budaya": [
    "Pameran Seni", "Pentas Budaya", "Fotografi",
    "Seni Rupa", "Crafting", "Pameran Museum",
    "Fashion Show"
  ],
  "Komunitas": [
    "Kegiatan Relawan", "Kegiatan Sosial", "Gathering Komunitas",
    "Komunitas Hobi", "Meetup", "Charity Event"
  ],
  "Kuliner": [
    "Festival Kuliner", "Food Tasting", "Workshop Memasak",
    "Street Food Event"
  ],
  "Kesehatan": [
    "Seminar Kesehatan", "Medical Check Event",
    "Workshop Kesehatan Mental", "Donor Darah"
  ],
  "Agama & Spiritual": [
    "Kajian", "Retreat", "Pengajian", "Event Keagamaan",
    "Meditasi"
  ],
  "Travel & Outdoor": [
    "Camping", "Hiking", "Trip Wisata", "Outdoor Gathering",
    "Photography Trip"
  ],
  "Keluarga & Anak": [
    "Family Gathering", "Event Anak", "Workshop Parenting",
    "Pentas Anak"
  ],
  "Fashion & Beauty": [
    "Fashion Expo", "Beauty Class", "Makeup Workshop",
    "Brand Launching"
  ]
};

// District options - sama dengan di CariEventPage
const DISTRICTS = [
  "Tegalrejo", "Jetis", "Gondokusuman", "Danurejan", "Gedongtengen", "Ngampilan", "Wirobrajan", "Mantrijeron",
  "Kraton", "Gondomanan", "Pakualaman", "Mergangsan", "Umbulharjo", "Kotagede"
];

// Warna untuk setiap parent category
const CATEGORY_COLORS = {
  "Hiburan": "bg-purple-500",
  "Teknologi": "bg-blue-500",
  "Edukasi": "bg-cyan-500",
  "Olahraga": "bg-green-500",
  "Bisnis & Profesional": "bg-amber-500",
  "Seni & Budaya": "bg-pink-500",
  "Komunitas": "bg-indigo-500",
  "Kuliner": "bg-orange-500",
  "Kesehatan": "bg-red-500",
  "Agama & Spiritual": "bg-teal-500",
  "Travel & Outdoor": "bg-emerald-500",
  "Keluarga & Anak": "bg-rose-500",
  "Fashion & Beauty": "bg-fuchsia-500",
  "Lainnya": "bg-gray-500"
};

export default function CalendarEventPage() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();
  
  // State untuk data
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("calendar"); // 'calendar' atau 'list'
  
  // State untuk filter
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState(""); 
  const [showFilters, setShowFilters] = useState(false);

  // Nama bulan dan hari dalam Bahasa Indonesia
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getApprovedEvents();
      setEvents(response.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      showNotification("Gagal memuat data event", "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  // Mendapatkan parent category dari child category
  const getParentCategory = (category) => {
    if (!category) return "Lainnya";
    
    // Cek jika category adalah parent category
    if (CATEGORIES[category]) {
      return category;
    }
    
    // Cari parent dari child category
    for (const [parent, children] of Object.entries(CATEGORIES)) {
      if (children.includes(category)) {
        return parent;
      }
    }
    
    return "Lainnya";
  };

  // Get category color based on parent category
  const getCategoryColor = (category) => {
    const parentCategory = getParentCategory(category);
    return CATEGORY_COLORS[parentCategory] || CATEGORY_COLORS["Lainnya"];
  };

  // Mendapatkan parent categories unik dari events
  const uniqueParentCategories = useMemo(() => {
    const parentCats = new Set();
    events.forEach(event => {
      const parent = getParentCategory(event.category);
      parentCats.add(parent);
    });
    return Array.from(parentCats).sort();
  }, [events]);

  // Mendapatkan districts unik dari events
  const uniqueDistricts = useMemo(() => {
    const districts = new Set();
    events.forEach(event => {
      if (event.district) {
        districts.add(event.district);
      }
    });
    return Array.from(districts).sort();
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = !searchTerm || 
        event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const eventParentCategory = getParentCategory(event.category);
      const matchesCategory = !categoryFilter || eventParentCategory === categoryFilter;
      
      const matchesDistrict = !districtFilter || event.district === districtFilter;
      
      return matchesSearch && matchesCategory && matchesDistrict;
    });
  }, [events, searchTerm, categoryFilter, districtFilter]);

  // Mendapatkan events berdasarkan tanggal
  const getEventsForDate = (date) => {
    if (!date) return [];
    
    return filteredEvents.filter(event => {
      if (!event.date_start) return false;
      
      const eventStart = new Date(event.date_start);
      const eventEnd = event.date_end ? new Date(event.date_end) : eventStart;
      const checkDate = new Date(date);
      
      // Reset time untuk perbandingan tanggal saja
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(23, 59, 59, 999);
      checkDate.setHours(0, 0, 0, 0);
      
      return checkDate >= eventStart && checkDate <= eventEnd;
    });
  };

  // Mendapatkan events untuk bulan tertentu (untuk list view)
  const getEventsForMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    return filteredEvents.filter(event => {
      if (!event.date_start) return false;
      
      const eventStart = new Date(event.date_start);
      const eventEnd = event.date_end ? new Date(event.date_end) : eventStart;

      return (
        (eventStart >= monthStart && eventStart <= monthEnd) ||
        (eventEnd >= monthStart && eventEnd <= monthEnd) ||
        (eventStart < monthStart && eventEnd > monthEnd)
      );
    }).sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  }, [filteredEvents, currentDate]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const days = [];
    
    // Hari-hari dari bulan sebelumnya
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // Hari-hari bulan ini
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    // Hari-hari dari bulan berikutnya untuk melengkapi grid
    const remainingDays = 42 - days.length; // 6 rows x 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return days;
  }, [currentDate]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Format functions
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
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
    
    const startStr = start.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    if (start.toDateString() === end.toDateString()) {
      return startStr;
    }
    
    const endStr = end.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    return `${startStr} - ${endStr}`;
  };

  const formatRupiah = (angka) => {
    if (!angka && angka !== 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is selected
  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  // Handle date click
  const handleDateClick = (dayInfo) => {
    setSelectedDate(dayInfo.date);
  };

  // Handle event click
  const handleEventClick = (eventId) => {
    navigate(`/detailEvent/${eventId}`);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setDistrictFilter("");
  };

  const hasActiveFilters = searchTerm || categoryFilter || districtFilter;

  // Get minimum price from ticket categories
  const getMinPrice = (event) => {
    if (!event.ticket_categories || event.ticket_categories.length === 0) {
      return 0;
    }
    const prices = event.ticket_categories.map(tc => tc.price).filter(p => p !== undefined && p !== null);
    if (prices.length === 0) return 0;
    return Math.min(...prices);
  };

  // Parent categories for legend
  const parentCategoriesForLegend = Object.keys(CATEGORIES);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  Kalender Event
                </h1>
                <p className="text-gray-600 mt-2">
                  Temukan event menarik berdasarkan tanggal
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* View Mode Toggle */}
                <motion.div 
                  className="flex bg-gray-100 rounded-lg p-1"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                      viewMode === "calendar" 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Calendar size={18} />
                    <span className="hidden sm:inline">Kalender</span>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                      viewMode === "list" 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <List size={18} />
                    <span className="hidden sm:inline">Daftar</span>
                  </button>
                </motion.div>

                {hasActiveFilters && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
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
                  onClick={fetchEvents}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">Refresh</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Event Tersedia</p>
                  <p className="text-3xl font-bold mt-1">{filteredEvents.length} Event</p>
                  <p className="text-blue-100 text-sm mt-2">
                    {getEventsForMonth.length} event di bulan {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </p>
                </div>
                <motion.div 
                  className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <CalendarDays size={32} className="text-blue-600" />
                </motion.div>
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
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter size={18} />
                  {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
                </motion.button>
              </div>

              {/* Search Bar - Selalu tampil */}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
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
                          {parentCategoriesForLegend.map(category => (
                            <option key={category} value={category}>{category}</option>
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
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <select
                            value={districtFilter}
                            onChange={(e) => setDistrictFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="">Semua Kecamatan</option>
                            {DISTRICTS.map(district => (
                              <option key={district} value={district}>{district}</option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-end"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <button
                          onClick={goToToday}
                          className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-lg transition-colors font-medium"
                        >
                          <Calendar size={18} />
                          Ke Hari Ini
                        </button>
                      </motion.div>
                    </div>

                    {/* Info Filter Aktif */}
                    {hasActiveFilters && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <p className="text-sm text-blue-800">
                          Filter aktif: 
                          {searchTerm && ` Pencarian: "${searchTerm}"`}
                          {categoryFilter && ` Kategori: ${categoryFilter}`}
                          {districtFilter && ` Kecamatan: ${districtFilter}`}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Loading State */}
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-4">Memuat data event...</p>
              </motion.div>
            ) : viewMode === "calendar" ? (
              /* Calendar View */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Calendar Navigation */}
                <motion.div 
                  className="flex items-center justify-between mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.button
                    onClick={goToPreviousMonth}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft size={20} />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </motion.button>
                  
                  <motion.h2 
                    className="text-xl md:text-2xl font-bold text-gray-900"
                    key={`${currentDate.getMonth()}-${currentDate.getFullYear()}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </motion.h2>
                  
                  <motion.button
                    onClick={goToNextMonth}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05, x: 2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight size={20} />
                  </motion.button>
                </motion.div>

                {/* Calendar Grid */}
                <motion.div 
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 bg-blue-600 text-white">
                    {dayNames.map(day => (
                      <motion.div 
                        key={day} 
                        className="py-3 text-center font-semibold text-sm"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        {day}
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Calendar Days */}
                  <div className="grid grid-cols-7">
                    {calendarDays.map((dayInfo, index) => {
                      const dayEvents = getEventsForDate(dayInfo.date);
                      const hasEvents = dayEvents.length > 0;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: index * 0.01 }}
                          onClick={() => handleDateClick(dayInfo)}
                          className={`min-h-[100px] md:min-h-[120px] p-2 border-b border-r border-gray-200 cursor-pointer transition-all ${
                            !dayInfo.isCurrentMonth ? "bg-gray-50 opacity-60" : "bg-white hover:bg-blue-50"
                          } ${isSelected(dayInfo.date) ? "ring-2 ring-blue-500 ring-inset bg-blue-50" : ""} ${
                            hasEvents ? "hover:shadow-inner" : ""
                          }`}
                          whileHover={{ 
                            scale: 1.02,
                            transition: { type: "spring", stiffness: 400, damping: 17 }
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Day Number */}
                          <div className="flex justify-start mb-1">
                            <motion.span 
                              className={`text-sm font-medium inline-flex items-center justify-center ${
                                !dayInfo.isCurrentMonth ? "text-gray-400" : 
                                isToday(dayInfo.date) ? "bg-blue-600 text-white w-7 h-7 rounded-full" :
                                "text-gray-900"
                              }`}
                              whileHover={{ scale: 1.2 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                              {dayInfo.day}
                            </motion.span>
                          </div>
                          
                          {/* Events */}
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event, eventIndex) => (
                              <motion.div
                                key={event.event_id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: eventIndex * 0.1 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(event.event_id);
                                }}
                                className={`${getCategoryColor(event.category)} text-white text-xs px-2 py-1 rounded truncate hover:opacity-80 transition-opacity cursor-pointer shadow-sm`}
                                title={`${event.name} - ${getParentCategory(event.category)}`}
                                whileHover={{ 
                                  scale: 1.05,
                                  y: -1,
                                  transition: { type: "spring", stiffness: 400, damping: 17 }
                                }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {event.name}
                              </motion.div>
                            ))}
                            {dayEvents.length > 2 && (
                              <motion.div 
                                className="text-xs text-blue-600 font-medium pl-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                              >
                                +{dayEvents.length - 2} lainnya
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Selected Date Events */}
                <AnimatePresence>
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="mt-8"
                    >
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-900">
                            Event pada {selectedDate.toLocaleDateString('id-ID', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </h3>
                          <motion.button
                            onClick={() => setSelectedDate(null)}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-white transition-colors"
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X size={20} />
                          </motion.button>
                        </div>
                        
                        {getEventsForDate(selectedDate).length === 0 ? (
                          <motion.div 
                            className="text-center py-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Tidak ada event pada tanggal ini</p>
                          </motion.div>
                        ) : (
                          <div className="space-y-4">
                            {getEventsForDate(selectedDate).map((event, index) => (
                              <motion.div
                                key={event.event_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                              >
                                <EventCard 
                                  event={event} 
                                  onClick={() => handleEventClick(event.event_id)}
                                  formatDateRange={formatDateRange}
                                  formatRupiah={formatRupiah}
                                  getMinPrice={getMinPrice}
                                  getCategoryColor={getCategoryColor}
                                  getParentCategory={getParentCategory}
                                />
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* List View */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.h2 
                  className="text-xl font-bold text-gray-900 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Event di {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </motion.h2>
                
                {/* Month Navigation */}
                <motion.div 
                  className="flex items-center justify-center gap-4 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.button
                    onClick={goToPreviousMonth}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft size={20} />
                    Sebelumnya
                  </motion.button>
                  
                  <motion.button
                    onClick={goToNextMonth}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05, x: 2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Selanjutnya
                    <ChevronRight size={20} />
                  </motion.button>
                </motion.div>
                
                {getEventsForMonth.length === 0 ? (
                  <motion.div 
                    className="text-center py-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">
                      Tidak ada event di bulan ini
                    </p>
                    <p className="text-gray-400 text-sm">
                      Coba pilih bulan lain atau ubah filter pencarian
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {getEventsForMonth.map((event, index) => (
                      <motion.div
                        key={event.event_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <EventCard 
                          event={event} 
                          onClick={() => handleEventClick(event.event_id)}
                          formatDateRange={formatDateRange}
                          formatRupiah={formatRupiah}
                          getMinPrice={getMinPrice}
                          getCategoryColor={getCategoryColor}
                          getParentCategory={getParentCategory}
                          showFullDate
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Legend */}
            <motion.div 
              className="mt-8 pt-6 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Legenda Kategori:</h4>
              <div className="flex flex-wrap gap-3">
                {parentCategoriesForLegend.map((category, index) => (
                  <motion.div 
                    key={category} 
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setCategoryFilter(categoryFilter === category ? "" : category)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`w-3 h-3 rounded ${CATEGORY_COLORS[category]}`}></div>
                    <span className={`text-sm ${categoryFilter === category ? "font-bold text-blue-600" : "text-gray-600"}`}>
                      {category}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Event Card Component
function EventCard({ event, onClick, formatDateRange, formatRupiah, getMinPrice, getCategoryColor, getParentCategory, showFullDate = false }) {
  const parentCategory = getParentCategory(event.category);
  
  return (
    <motion.div
      whileHover={{ 
        scale: 1.01,
        y: -2,
        transition: { type: "spring", stiffness: 400, damping: 17 }
      }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
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
                e.target.style.display = 'none';
              }}
            />
          </motion.div>
        )}
        
        {/* Event Info */}
        <div className="flex-1 p-4 md:p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <motion.span 
                  className={`${getCategoryColor(event.category)} text-white text-xs px-2 py-1 rounded-full`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {parentCategory}
                </motion.span>
                {event.category !== parentCategory && event.category && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {event.category}
                  </span>
                )}
                {event.child_category && (
                  <span className="text-xs text-gray-400">• {event.child_category}</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {event.name}
              </h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-600 flex-shrink-0" />
              <span>
                {formatDateRange(event.date_start, event.date_end)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-red-500 flex-shrink-0" />
              <span className="truncate">{event.venue || event.location || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-green-600 flex-shrink-0" />
              <span>
                {event.date_start ? new Date(event.date_start).toLocaleTimeString('id-ID', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : "-"}
              </span>
            </div>
            {event.district && (
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-purple-600 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <span className="text-xs text-gray-500">Mulai dari</span>
              <p className="text-lg font-bold text-blue-600">
                {getMinPrice(event) === 0 ? "GRATIS" : formatRupiah(getMinPrice(event))}
              </p>
            </div>
            <motion.button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              Lihat Detail
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}