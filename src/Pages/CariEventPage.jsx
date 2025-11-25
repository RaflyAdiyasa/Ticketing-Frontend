import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { Search, Filter, Calendar, MapPin, X, RefreshCw } from "lucide-react";

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

export default function CariEvent() {
  const navigate = useNavigate();
  const { namaEvent } = useParams();
  
  const formatRupiah = (angka) => {
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

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // State untuk filter
  const [filters, setFilters] = useState({
    keyword: namaEvent || "",
    date: "",
    category: "",
    district: ""
  });

  // State untuk sorting
  const [sortBy, setSortBy] = useState("popularitas");

  // Load data dari backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/events');
        let eventsData = response.data;
        
        // Filter hanya event yang approved
        eventsData = eventsData.filter(event => event.status === "approved");
        
        // URUTKAN DATA SAAT DITERIMA DARI API BERDASARKAN POPULARITAS
        eventsData = eventsData.sort((eventA, eventB) => {
          const salesA = eventA.total_tickets_sold || 0;
          const salesB = eventB.total_tickets_sold || 0;
          return salesB - salesA; // Descending: terbesar ke terkecil
        });
        
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
      result = result.filter(event => event.category === filters.category);
    }

    if (filters.district) {
      result = result.filter(event => event.district === filters.district);
    }

    // APPLY SORTING
    if (sortBy === "popularitas") {
      result = result.sort((eventA, eventB) => {
        const salesA = eventA.total_tickets_sold || 0;
        const salesB = eventB.total_tickets_sold || 0;
        return salesB - salesA;
      });
    } else if (sortBy === "abjad-asc") {
      result = result.sort((eventA, eventB) => eventA.name.localeCompare(eventB.name));
    } else if (sortBy === "abjad-desc") {
      result = result.sort((eventA, eventB) => eventB.name.localeCompare(eventA.name));
    } else if (sortBy === "terdekat") {
      const now = new Date();
      result = result.sort((eventA, eventB) => {
        const dateA = new Date(eventA.date_start);
        const dateB = new Date(eventB.date_start);
        const diffA = Math.abs(dateA - now);
        const diffB = Math.abs(dateB - now);
        return diffA - diffB;
      });
    }

    setFilteredEvents(result);
  }, [filters, events, sortBy]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler untuk sorting
  const handleSortChange = (value) => {
    setSortBy(value);
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

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mt-32">
            
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
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>
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

                    {/* Filter Kategori - Menggunakan parent categories dari EventRegister */}
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

                    {/* Filter District - Menggunakan DISTRICTS dari EventRegister */}
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

                  {/* Sorting */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Urutkan Berdasarkan
                      </label>
                      <select 
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="popularitas">Popularitas</option>
                        <option value="abjad-asc">Nama A-Z</option>
                        <option value="abjad-desc">Nama Z-A</option>
                        <option value="terdekat">Terdekat Waktu</option>
                      </select>
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
                <Search className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 font-medium text-lg mb-2">
                  {hasActiveFilters ? "Tidak ada event yang sesuai dengan filter" : "Tidak ada event yang tersedia"}
                </p>
                <p className="text-gray-400 text-sm mb-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEvents.map((event) => {
                  const minPrice = event.ticket_categories && event.ticket_categories.length > 0
                    ? Math.min(...event.ticket_categories.map(tc => tc.price))
                    : 0;

                  return (
                    <div
                      key={event.event_id}
                      onClick={() => handleCardClick(event.event_id)}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
                    >
                      <div className="relative w-full pb-[70%] bg-gray-300 overflow-hidden">
                        <img
                          src={event.image || "https://cdn2.steamgriddb.com/icon_thumb/63872edc3fa52d645b3d48f6d98caf2c.png"}
                          alt={event.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = "https://cdn2.steamgriddb.com/icon_thumb/63872edc3fa52d645b3d48f6d98caf2c.png";
                          }}
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {event.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                          {event.name}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatDate(event.date_start, event.date_end)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span className="line-clamp-1">{event.district || event.location}</span>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div>
                              <p className="text-xs text-gray-500">Mulai dari</p>
                              <p className="text-lg font-bold text-red-900">
                                {formatRupiah(minPrice)}
                              </p>
                            </div>
                            
                            {event.total_tickets_sold > 0 && (
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Terjual</p>
                                <p className="text-sm font-semibold text-green-600">
                                  {event.total_tickets_sold}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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