import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function CariEvent() {
  const navigate = useNavigate();
  
  // Fungsi helper: ubah angka ke format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Format tanggal dari backend
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
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk filter
  const [filters, setFilters] = useState({
    keyword: "",
    date: "",
    category: "",
    city: ""
  });

  // Load data dari backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/events');
        const eventsData = response.data;
        
        setEvents(eventsData);
        setFilteredEvents(eventsData);
        
        // Extract unique cities dan categories
        const uniqueCities = [...new Set(eventsData.map(event => event.city).filter(Boolean))];
        const uniqueCategories = [...new Set(eventsData.map(event => event.category).filter(Boolean))];
        
        setCities(uniqueCities);
        setCategories(uniqueCategories);
        
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = events;

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

    if (filters.city) {
      result = result.filter(event => event.city === filters.city);
    }

    setFilteredEvents(result);
  }, [filters, events]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCardClick = (id) => {
    navigate(`/detailEvent/${id}`);
  };

  const handleApplyFilters = () => {
    // Filters sudah diterapkan secara real-time melalui useEffect
    console.log("Filters applied:", filters);
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-5">
            
            {/* === FILTER PANEL === */}
            <div className="col-span-2 p-4 bg-white border rounded-md shadow-sm self-start">
              <h3 className="font-semibold mb-4">Filter Pencarianmu</h3>

              <div className="flex flex-col space-y-3 text-sm">
                <div>
                  <label className="block mb-1">Kata kunci :</label>
                  <input
                    type="text"
                    value={filters.keyword}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                    placeholder="Cari event..."
                    className="w-full border border-gray-400 rounded px-2 py-1"
                  />
                </div>

                <div>
                  <label className="block mb-1">Tanggal :</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="w-full border border-gray-400 rounded px-2 py-1"
                  />
                </div>

                <div>
                  <label className="block mb-1">Kategori :</label>
                  <select 
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full border border-gray-400 rounded px-2 py-1"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Lokasi :</label>
                  <select 
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full border border-gray-400 rounded px-2 py-1"
                  >
                    <option value="">Semua Kota</option>
                    {cities.map((city, index) => (
                      <option key={index} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={handleApplyFilters}
                  className="bg-gray-700 text-white py-1.5 rounded hover:bg-gray-800"
                >
                  FILTER
                </button>
              </div>
            </div>

            {/* === EVENT GRID === */}
            <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-6 rounded-md">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-lg">Memuat event...</div>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-lg text-gray-500">Tidak ada event yang ditemukan</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-30">
                  {filteredEvents.map((event) => {
                    // Cari harga termurah dari ticket categories
                    const minPrice = event.ticket_categories && event.ticket_categories.length > 0
                      ? Math.min(...event.ticket_categories.map(tc => tc.price))
                      : 0;

                    return (
                      <div
                        key={event.event_id}
                        onClick={() => handleCardClick(event.event_id)}
                        className="bg-white border rounded-md shadow-sm overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                      >
                        {/* Kontainer gambar persegi (rasio 1:1) */}
                        <div className="relative w-full pb-[100%] bg-gray-300">
                          <img
                            src={event.image || "https://cdn2.steamgriddb.com/icon_thumb/63872edc3fa52d645b3d48f6d98caf2c.png"}
                            alt={event.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://cdn2.steamgriddb.com/icon_thumb/63872edc3fa52d645b3d48f6d98caf2c.png";
                            }}
                          />
                        </div>

                        {/* Informasi event */}
                        <div className="p-2 text-sm">
                          <p className="font-semibold text-base truncate whitespace-nowrap overflow-hidden">
                            {event.name}
                          </p>
                          <p className="text-xs text-gray-700">
                            {formatDate(event.date_start, event.date_end)}
                          </p>
                          <p className="text-xs text-gray-700 mt-3">Mulai dari</p>
                          <p className="text-base text-red-900 font-semibold">
                            {formatRupiah(minPrice)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}