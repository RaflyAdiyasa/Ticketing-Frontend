import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import QRCodeGenerator from "../components/QRCodeGenerator";
import { ticketAPI } from "../services/api";
import { Search, Filter, Calendar, X, Edit, Save, ChevronDown, ChevronUp, Tag } from "lucide-react";

export default function TiketSaya() {
  const navigate = useNavigate();
  const [expandedTickets, setExpandedTickets] = useState({});
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk filter dan sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("event");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingTag, setEditingTag] = useState({});
  const [tagInput, setTagInput] = useState("");

  // Fetch tickets data from API
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketAPI.getTickets();
      setTickets(response.data || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Gagal memuat tiket");
    } finally {
      setLoading(false);
    }
  };

  // Fetch ticket code for QR generation
  const fetchTicketCode = async (ticketId) => {
    try {
      const response = await ticketAPI.getTicketCode(ticketId);
      return response.data.ticket;
    } catch (err) {
      console.error("Error fetching ticket code:", err);
      throw err;
    }
  };

  // Update ticket tag
  const updateTicketTag = async (ticketId, newTag) => {
    try {
      await ticketAPI.updateTagTicket(ticketId, { tag: newTag });
      showNotification("Catatan tiket berhasil diperbarui", "Sukses", "success");
      fetchTickets(); // Refresh data
    } catch (err) {
      console.error("Error updating ticket tag:", err);
      showNotification("Gagal memperbarui catatan tiket", "Error", "error");
    }
  };

  // Format tanggal untuk display
  const formatDateRange = (startDate, endDate) => {
    if (startDate === endDate) {
      return startDate;
    }
    return `${startDate} - ${endDate}`;
  };

  // Format date from API response
  const formatAPIDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time from API response
  const formatAPITime = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Process API data to match frontend structure
  const processTicketData = (apiTickets) => {
    const groupedTickets = {};
    
    apiTickets.forEach(ticket => {
      const eventId = ticket.event?.name || "unknown";
      
      if (!groupedTickets[eventId]) {
        groupedTickets[eventId] = {
          id: eventId,
          eventName: ticket.event?.name || "Event",
          address: `${ticket.event?.location || ''}, ${ticket.event?.city || ''}`.trim() || "Alamat tidak tersedia",
          startDate: formatAPIDate(ticket.event?.date_start),
          endDate: formatAPIDate(ticket.event?.date_end),
          details: []
        };
      }

      // Add ticket detail - menggunakan tag dari API atau default yang lebih jelas
      const defaultTag = "Klik untuk menambahkan catatan";
      groupedTickets[eventId].details.push({
        type: ticket.ticket_category?.name || "Tiket",
        description: ticket.ticket_category?.description || "Tiket masuk event",
        startDate: formatAPIDate(ticket.ticket_category?.date_time_start),
        endDate: formatAPIDate(ticket.ticket_category?.date_time_end),
        timeRange: `${formatAPITime(ticket.ticket_category?.date_time_start)} - ${formatAPITime(ticket.ticket_category?.date_time_end)}`,
        ticketId: ticket.ticket_id,
        qrCode: ticket.code,
        status: "active",
        tag: ticket.tag || defaultTag, // Gunakan default tag yang lebih jelas
        rawData: ticket
      });
    });

    return Object.values(groupedTickets);
  };

  // Get unique tags for filter
  const getUniqueTags = (processedTickets) => {
    const allTags = new Set();
    
    processedTickets.forEach(ticket => {
      ticket.details.forEach(detail => {
        if (detail.tag && detail.tag !== "Klik untuk menambahkan catatan") {
          allTags.add(detail.tag);
        }
      });
    });

    return Array.from(allTags).map(tag => ({
      value: tag,
      label: tag
    }));
  };

  // Apply filters and sorting
  const getFilteredAndSortedTickets = (processedTickets) => {
    let filtered = [...processedTickets];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.details.some(detail => 
          detail.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          detail.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          detail.tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter(ticket => 
        ticket.details.some(detail => detail.tag === selectedTag)
      );
    }

    // Sort tickets
    filtered = filtered.map(ticket => {
      const sortedDetails = [...ticket.details].sort((a, b) => {
        let compareResult = 0;
        
        switch (sortBy) {
          case "type":
            compareResult = a.type.localeCompare(b.type);
            break;
          case "date":
            compareResult = new Date(a.startDate) - new Date(b.startDate);
            break;
          case "tag":
            compareResult = a.tag.localeCompare(b.tag);
            break;
          default:
            compareResult = a.type.localeCompare(b.type);
        }

        return sortOrder === "desc" ? -compareResult : compareResult;
      });
      return { ...ticket, details: sortedDetails };
    });

    // Sort events
    filtered.sort((a, b) => {
      let compareResult = 0;
      
      switch (sortBy) {
        case "event":
          compareResult = a.eventName.localeCompare(b.eventName);
          break;
        case "date":
          compareResult = new Date(a.startDate) - new Date(b.startDate);
          break;
        default:
          compareResult = a.eventName.localeCompare(b.eventName);
      }

      return sortOrder === "desc" ? -compareResult : compareResult;
    });

    return filtered;
  };

  // Fungsi untuk toggle dropdown
  const toggleDropdown = (ticketId) => {
    setExpandedTickets(prev => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  // Fungsi untuk menampilkan QR Code dan detail tiket
  const handleShowQR = async (ticket, detail) => {
    try {
      const ticketData = await fetchTicketCode(detail.ticketId);
      
      setSelectedTicket({
        event: {
          eventName: ticketData.event?.name || "Event",
          address: `${ticketData.event?.location || ''}, ${ticketData.event?.city || ''}`.trim() || "Alamat tidak tersedia",
          eventDate: formatDateRange(
            formatAPIDate(ticketData.event?.date_start),
            formatAPIDate(ticketData.event?.date_end)
          )
        },
        detail: {
          ...detail,
          qrCode: ticketData.code,
          ticketId: ticketData.ticket_id,
          type: ticketData.ticket_category?.name || "Tiket",
          startDate: formatAPIDate(ticketData.ticket_category?.date_time_start),
          endDate: formatAPIDate(ticketData.ticket_category?.date_time_end),
          description: ticketData.ticket_category?.description || "Tiket masuk event",
          timeRange: `${formatAPITime(ticketData.ticket_category?.date_time_start)} - ${formatAPITime(ticketData.ticket_category?.date_time_end)}`,
          tag: ticketData.tag || "Klik untuk menambahkan catatan"
        }
      });
      setShowQRDialog(true);
    } catch (err) {
      console.error("Error showing QR:", err);
      setSelectedTicket({
        event: {
          ...ticket,
          eventDate: formatDateRange(ticket.startDate, ticket.endDate)
        },
        detail: detail
      });
      setShowQRDialog(true);
    }
  };

  // Fungsi untuk menutup dialog QR
  const handleCloseQR = () => {
    setShowQRDialog(false);
    setSelectedTicket(null);
  };

  // Handle tag editing
  const startEditingTag = (ticketId, currentTag) => {
    setEditingTag({ [ticketId]: true });
    setTagInput(currentTag === "Klik untuk menambahkan catatan" ? "" : currentTag);
  };

  const saveTag = (ticketId) => {
    const finalTag = tagInput.trim() || "Klik untuk menambahkan catatan";
    updateTicketTag(ticketId, finalTag);
    setEditingTag({ [ticketId]: false });
    setTagInput("");
  };

  const cancelEditing = () => {
    setEditingTag({});
    setTagInput("");
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag("");
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Notification function (placeholder)
  const showNotification = (message, title, type) => {
    // Implement your notification logic here
    console.log(`${type}: ${title} - ${message}`);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Memuat tiket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
            <p className="text-red-600 font-medium mb-4">Error: {error}</p>
            <button 
              onClick={fetchTickets} 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const processedTickets = processTicketData(tickets);
  const filteredTickets = getFilteredAndSortedTickets(processedTickets);
  const uniqueTags = getUniqueTags(processedTickets);
  const hasActiveFilters = searchTerm || selectedTag;

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 bg-white shadow-2xl rounded-2xl">
          
          {/* Header dengan gradient */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
              <Tag className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Tiket Saya
            </h1>
            <p className="text-gray-600 mt-2 font-medium">
              {processedTickets.length > 0 
                ? `Total ${tickets.length} tiket aktif` 
                : 'Belum ada tiket aktif'}
            </p>
          </div>

          {/* Panel Filter dan Pencarian yang lebih estetik */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Filter & Pencarian</h3>
                <p className="text-sm text-gray-600 mt-1">Temukan tiket Anda dengan mudah</p>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-white border border-blue-200 text-blue-700 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-all shadow-sm font-medium"
              >
                <Filter size={18} />
                {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
              </button>
            </div>

            {showFilters && (
              <div className="space-y-4 pt-4 border-t border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Pencarian */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Cari Tiket
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Cari tiket, event, atau catatan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Filter Tag */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Filter Berdasarkan Catatan
                    </label>
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    >
                      <option value="">Semua Catatan</option>
                      {uniqueTags.map(tag => (
                        <option key={tag.value} value={tag.value}>
                          {tag.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sorting */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Urutkan Berdasarkan
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                      >
                        <option value="event">Nama Event</option>
                        <option value="type">Jenis Tiket</option>
                        <option value="date">Tanggal</option>
                        <option value="tag">Catatan</option>
                      </select>
                      <button
                        onClick={toggleSortOrder}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                        title={sortOrder === "asc" ? "Urutkan Menurun" : "Urutkan Menaik"}
                      >
                        {sortOrder === "asc" ? "A→Z" : "Z→A"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info Filter Aktif */}
                {hasActiveFilters && (
                  <div className="flex items-center justify-between p-3 bg-blue-100 border border-blue-300 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-800 font-medium">Filter aktif:</span>
                      {searchTerm && (
                        <span className="inline-flex items-center gap-1 bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm">
                          Pencarian: "{searchTerm}"
                        </span>
                      )}
                      {selectedTag && (
                        <span className="inline-flex items-center gap-1 bg-indigo-200 text-indigo-800 px-2 py-1 rounded text-sm">
                          Catatan: "{selectedTag}"
                        </span>
                      )}
                    </div>
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                    >
                      <X size={16} />
                      Hapus Filter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Daftar Tiket */}
          <div className="space-y-4 pb-8">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="text-gray-500" size={24} />
                </div>
                <p className="text-gray-500 font-medium">
                  {hasActiveFilters 
                    ? "Tidak ada tiket yang sesuai dengan filter" 
                    : "Anda belum memiliki tiket aktif."
                  }
                </p>
                {!hasActiveFilters && (
                  <button 
                    onClick={() => navigate('/cariEvent')}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md font-medium"
                  >
                    Jelajahi Event
                  </button>
                )}
              </div>
            ) : (
              filteredTickets.map((ticket, index) => (
                <div key={ticket.id} className="border border-gray-300 rounded-xl p-5 bg-white hover:shadow-md transition-all duration-300">
                  
                  {/* Header Event dengan Tombol Rincian */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-gray-900">{ticket.eventName}</h2>
                      <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                        <span>📍</span>
                        {ticket.address}
                      </p>
                      <div className="flex items-center gap-1 text-gray-600 text-sm mt-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>Event: {formatDateRange(ticket.startDate, ticket.endDate)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleDropdown(ticket.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm text-sm font-medium"
                    >
                      <span>{expandedTickets[ticket.id] ? 'Sembunyikan' : 'Rincian'}</span>
                      {expandedTickets[ticket.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* Dropdown Content */}
                  {expandedTickets[ticket.id] && ticket.details.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      {/* Detail Tiket */}
                      <div className="space-y-3">
                        {ticket.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-sm mb-2">{detail.type}</h4>
                                
                                {/* Tag/Note Section yang lebih estetik */}
                                <div className="flex items-center gap-2 mb-3">
                                  {editingTag[detail.ticketId] ? (
                                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-300 shadow-sm">
                                      <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        className="text-sm px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-48"
                                        placeholder="Tambahkan catatan pribadi..."
                                        maxLength={50}
                                        autoFocus
                                      />
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => saveTag(detail.ticketId)}
                                          className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-50"
                                          title="Simpan"
                                        >
                                          <Save size={16} />
                                        </button>
                                        <button
                                          onClick={cancelEditing}
                                          className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                                          title="Batal"
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                                        detail.tag === "Klik untuk menambahkan catatan" 
                                          ? "bg-gray-200 text-gray-700 border border-gray-300" 
                                          : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
                                      }`}>
                                        {detail.tag}
                                      </span>
                                      <button
                                        onClick={() => startEditingTag(detail.ticketId, detail.tag)}
                                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                                        title="Edit catatan"
                                      >
                                        <Edit size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 text-gray-600 text-xs mb-2">
                                  <Calendar className="w-3 h-3 text-blue-600" />
                                  <span>Tanggal Tiket: {formatDateRange(detail.startDate, detail.endDate)}</span>
                                </div>
                                {detail.timeRange && (
                                  <div className="flex items-center gap-1 text-gray-600 text-xs mb-2">
                                    <span>⏰ Waktu: {detail.timeRange}</span>
                                  </div>
                                )}
                                <div className="mt-2">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200 font-medium">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    Aktif
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleShowQR(ticket, detail)}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm text-sm font-medium whitespace-nowrap ml-4"
                              >
                                Tampilkan QR
                              </button>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-gray-600 text-sm">
                                {detail.description}
                              </p>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 font-mono">
                              ID: {detail.ticketId}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Jika tidak ada details tapi dropdown dibuka */}
                  {expandedTickets[ticket.id] && ticket.details.length === 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <p className="text-gray-500 text-sm text-center py-4">Tidak ada detail tiket tersedia.</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dialog QR Code & Detail Tiket yang lebih estetik */}
      {showQRDialog && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Tag className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {selectedTicket.event.eventName}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{selectedTicket.detail.type}</p>
              
              {/* QR Code Generator */}
              <div className="flex justify-center mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <QRCodeGenerator 
                  value={selectedTicket.detail.qrCode}
                  size={200}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#000000"
                  includeMargin={true}
                />
              </div>
              
              <p className="text-gray-500 text-xs mb-4 font-medium">
                Tunjukkan QR code ini saat masuk venue
              </p>
              
              {/* Detail Tiket */}
              <div className="text-left space-y-3 mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                  <span className="text-gray-600 text-sm font-medium">Ticket ID:</span>
                  <span className="font-semibold text-sm font-mono">{selectedTicket.detail.ticketId}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                  <span className="text-gray-600 text-sm font-medium">Jenis Tiket:</span>
                  <span className="font-semibold text-sm">{selectedTicket.detail.type}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                  <span className="text-gray-600 text-sm font-medium">Catatan:</span>
                  <span className={`font-semibold text-sm ${
                    selectedTicket.detail.tag === "Klik untuk menambahkan catatan" 
                      ? "text-gray-500 italic" 
                      : "text-blue-700"
                  }`}>
                    {selectedTicket.detail.tag}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                  <span className="text-gray-600 text-sm font-medium">Tanggal Event:</span>
                  <span className="font-semibold text-sm">
                    {selectedTicket.event.eventDate}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                  <span className="text-gray-600 text-sm font-medium">Tanggal Tiket:</span>
                  <span className="font-semibold text-sm">
                    {formatDateRange(selectedTicket.detail.startDate, selectedTicket.detail.endDate)}
                  </span>
                </div>
                {selectedTicket.detail.timeRange && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                    <span className="text-gray-600 text-sm font-medium">Waktu:</span>
                    <span className="font-semibold text-sm">{selectedTicket.detail.timeRange}</span>
                  </div>
                )}
                <div className="flex justify-between items-start py-1 border-b border-gray-200 last:border-b-0">
                  <span className="text-gray-600 text-sm font-medium">Alamat:</span>
                  <span className="font-semibold text-sm text-right max-w-[200px]">
                    {selectedTicket.event.address}
                  </span>
                </div>
                <div className="flex justify-between items-start py-1">
                  <span className="text-gray-600 text-sm font-medium">Keterangan:</span>
                  <span className="font-semibold text-sm text-right max-w-[200px]">
                    {selectedTicket.detail.description}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleCloseQR}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}