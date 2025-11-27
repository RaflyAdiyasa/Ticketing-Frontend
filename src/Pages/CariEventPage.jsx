import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import Navbar from "../components/Navbar";
import { eventAPI } from "../services/api";
import { Search, Filter, Calendar, MapPin, X, RefreshCw, Heart, ChevronLeft, ChevronRight, TrendingUp, ShoppingBag, Clock, ArrowRight, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import CATEGORIES dan DISTRICTS dari mapping EventRegister
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

// District options - sama dengan di EventRegister
const DISTRICTS = [
  "Tegalrejo", "Jetis", "Gondokusuman", "Danurejan", "Gedongtengen", "Ngampilan", "Wirobrajan", "Mantrijeron",
  "Kraton", "Gondomanan", "Pakualaman", "Mergangsan", "Umbulharjo", "Kotagede"
];

// Category colors
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

const ITEMS_PER_PAGE = 15; // 5 columns x 3 rows

export default function CariEvent() {
  const navigate = useNavigate();
  const { namaEvent } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const formatRupiah = (angka) => {
    if (angka === 0) return "GRATIS";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatDate = (dateStart, dateEnd) => {
    const start = new Date(dateStart);
    const end = new Date(dateEnd);
    
    const formatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const startFormatted = start.toLocaleDateString('id-ID', formatOptions);
    const endFormatted = end.toLocaleDateString('id-ID', formatOptions);
    
    if (startFormatted === endFormatted) {
      return startFormatted;
    }
    return `${startFormatted} - ${endFormatted}`;
  };

  const getLowestPrice = (ticketCategories) => {
    if (!ticketCategories || ticketCategories.length === 0) return 0;
    const prices = ticketCategories.map((tc) => tc.price);
    return Math.min(...prices);
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

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [likedEvents, setLikedEvents] = useState(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // State untuk filter
  const [filters, setFilters] = useState({
    keyword: namaEvent || searchParams.get('keyword') || "",
    date: searchParams.get('date') || "",
    category: searchParams.get('category') || "",
    district: searchParams.get('district') || ""
  });

  // State untuk sorting - get initial value from URL
  const initialSort = searchParams.get('sort') || "popularitas";
  const [sortBy, setSortBy] = useState(initialSort);

  // Check login status
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Fetch liked events for logged in user
  useEffect(() => {
    const fetchLikedEvents = async () => {
      if (!isLoggedIn) return;
      try {
        const response = await eventAPI.getMyLikedEvents();
        const likedEventIds = new Set(
          (response.data?.liked_event || []).map(e => e.event_id)
        );
        setLikedEvents(likedEventIds);
      } catch (err) {
        console.error("Error fetching liked events:", err);
      }
    };
    fetchLikedEvents();
  }, [isLoggedIn]);

  // Load data dari backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventAPI.getApprovedEvents();
        let eventsData = response.data || [];
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Update keyword filter ketika namaEvent dari URL berubah
  useEffect(() => {
    if (namaEvent && namaEvent !== filters.keyword) {
      setFilters(prev => ({
        ...prev,
        keyword: namaEvent
      }));
    }
  }, [namaEvent, filters.keyword]);

  // Apply filters DAN sorting
  useEffect(() => {
    let result = [...events];

    // Apply filters
    if (filters.keyword) {
      result = result.filter(event => 
        event.name.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }

    if (filters.date) {
      const selectedDate = new Date(filters.date);
      result = result.filter(event => {
        const eventStartDate = new Date(event.date_start);
        const eventEndDate = new Date(event.date_end);
        return selectedDate >= eventStartDate && selectedDate <= eventEndDate;
      });
    }

    if (filters.category) {
      result = result.filter(event => {
        const eventParent = getParentCategory(event.category);
        return eventParent === filters.category || event.category === filters.category;
      });
    }

    if (filters.district) {
      result = result.filter(event => event.district === filters.district);
    }

    // APPLY SORTING
    if (sortBy === "popularitas") {
      result = result.sort((eventA, eventB) => {
        const likesA = eventA.total_likes || 0;
        const likesB = eventB.total_likes || 0;
        return likesB - likesA;
      });
    } else if (sortBy === "terlaris") {
      result = result.sort((eventA, eventB) => {
        const salesA = eventA.total_tickets_sold || 0;
        const salesB = eventB.total_tickets_sold || 0;
        return salesB - salesA;
      });
    } else if (sortBy === "terdekat") {
      const now = new Date();
      result = result.sort((eventA, eventB) => {
        const dateA = new Date(eventA.date_start);
        const dateB = new Date(eventB.date_start);
        // Filter hanya event yang akan datang
        const isUpcomingA = dateA >= now;
        const isUpcomingB = dateB >= now;
        
        if (isUpcomingA && !isUpcomingB) return -1;
        if (!isUpcomingA && isUpcomingB) return 1;
        
        return dateA - dateB;
      });
    }

    setFilteredEvents(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, events, sortBy]);

  // Handle like event
  const handleLikeEvent = async (eventId, e) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Capture the current like status BEFORE making any state changes
    const isCurrentlyLiked = likedEvents.has(eventId);

    try {
      await eventAPI.likeEvent(eventId);
      
      // Update likedEvents state
      setLikedEvents(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.delete(eventId);
        } else {
          newSet.add(eventId);
        }
        return newSet;
      });

      // Update like counts in events using the captured status
      setEvents(prev => prev.map(event => {
        if (event.event_id === eventId) {
          return {
            ...event,
            total_likes: isCurrentlyLiked 
              ? Math.max(0, (event.total_likes || 1) - 1) 
              : (event.total_likes || 0) + 1
          };
        }
        return event;
      }));
    } catch (err) {
      console.error("Error liking event:", err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler untuk sorting
  const handleSortChange = (value) => {
    setSortBy(value);
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', value);
    setSearchParams(newParams);
  };

  const handleCardClick = (id) => {
    navigate(`/detailEvent/${id}`);
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      date: "",
      category: "",
      district: ""
    });
    setSortBy("popularitas");
    navigate(`/cariEvent`);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const hasActiveFilters = filters.keyword || filters.date || filters.category || filters.district;

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Navbar />

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto mt-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
          >
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cari Event</h1>
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
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors font-medium"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Sort Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => handleSortChange('popularitas')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  sortBy === 'popularitas'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart size={18} className={sortBy === 'popularitas' ? 'fill-current' : ''} />
                Popularitas
              </button>
              <button
                onClick={() => handleSortChange('terlaris')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  sortBy === 'terlaris'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ShoppingBag size={18} />
                Terlaris
              </button>
              <button
                onClick={() => handleSortChange('terdekat')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  sortBy === 'terdekat'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Clock size={18} />
                Terdekat
              </button>
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
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                          value={filters.keyword}
                          onChange={(e) => handleFilterChange('keyword', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
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
                          value={filters.date}
                          onChange={(e) => handleFilterChange('date', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Filter Kategori */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Kategori
                      </label>
                      <select 
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Semua Kategori</option>
                        {Object.keys(CATEGORIES).map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filter District */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Kecamatan
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <select 
                          value={filters.district}
                          onChange={(e) => handleFilterChange('district', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="">Semua Kecamatan</option>
                          {DISTRICTS.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Info Filter Aktif */}
                  {hasActiveFilters && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Filter aktif: 
                        {filters.keyword && ` Nama: "${filters.keyword}"`}
                        {filters.date && ` Tanggal: ${new Date(filters.date).toLocaleDateString("id-ID")}`}
                        {filters.category && ` Kategori: ${filters.category}`}
                        {filters.district && ` Kecamatan: ${filters.district}`}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Daftar Event */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-600 font-medium">Memuat daftar event...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {hasActiveFilters ? "Tidak ada event yang sesuai dengan filter" : "Tidak ada event yang tersedia"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {hasActiveFilters 
                    ? "Coba ubah kriteria filter atau hapus filter untuk melihat semua event"
                    : "Coba refresh halaman atau periksa koneksi internet Anda"
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
              <>
                {/* Event Grid - 5 columns x 3 rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {paginatedEvents.map((event, index) => (
                    <motion.div
                      key={event.event_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.03 }}
                    >
                      <EventCard
                        event={event}
                        onClick={() => handleCardClick(event.event_id)}
                        formatRupiah={formatRupiah}
                        formatDate={formatDate}
                        getLowestPrice={getLowestPrice}
                        getCategoryColor={getCategoryColor}
                        getParentCategory={getParentCategory}
                        isLiked={likedEvents.has(event.event_id)}
                        onLike={(e) => handleLikeEvent(event.event_id, e)}
                        isLoggedIn={isLoggedIn}
                        sortBy={sortBy}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredEvents.length)} dari {filteredEvents.length} event
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ChevronLeft size={18} />
                        <span className="hidden sm:inline">Sebelumnya</span>
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, idx) => (
                          page === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        ))}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="hidden sm:inline">Selanjutnya</span>
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Event Card Component - consistent styling with LandingPage
function EventCard({ 
  event, 
  onClick, 
  formatRupiah, 
  formatDate, 
  getLowestPrice,
  getCategoryColor,
  getParentCategory,
  isLiked,
  onLike,
  isLoggedIn,
  sortBy
}) {
  const minPrice = getLowestPrice(event.ticket_categories);
  const parentCategory = getParentCategory(event.category);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group bg-gray-100 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={event.image || "https://cdn2.steamgriddb.com/icon_thumb/63872edc3fa52d645b3d48f6d98caf2c.png"}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "https://cdn2.steamgriddb.com/icon_thumb/63872edc3fa52d645b3d48f6d98caf2c.png";
          }}
        />
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`${getCategoryColor(event.category)} text-white text-xs px-2.5 py-1 rounded-full font-medium`}>
            {parentCategory}
          </span>
        </div>
        {/* Like Button */}
        <button
          onClick={onLike}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isLiked 
              ? 'bg-pink-500 text-white' 
              : 'bg-white/90 text-gray-600 hover:bg-pink-100 hover:text-pink-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.name}
        </h3>
        
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Calendar size={12} className="flex-shrink-0" />
            <span className="truncate">{formatDate(event.date_start, event.date_end)}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="truncate">{event.venue || event.district || event.location}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Mulai dari</p>
            <p className={`font-bold text-sm ${minPrice === 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
              {formatRupiah(minPrice)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {sortBy === 'terlaris' && event.total_tickets_sold > 0 && (
              <div className="flex items-center gap-1 text-emerald-600 text-xs">
                <ShoppingBag className="w-3 h-3" />
                <span className="font-medium">{event.total_tickets_sold}</span>
              </div>
            )}
            {sortBy === 'popularitas' && event.total_likes > 0 && (
              <div className="flex items-center gap-1 text-pink-500 text-xs">
                <Heart className="w-3 h-3 fill-current" />
                <span className="font-medium">{event.total_likes}</span>
              </div>
            )}
            <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}