import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import QRCodeGenerator from "../components/QRCodeGenerator";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";
import { ticketAPI } from "../services/api";
import { Search, X, Pencil, Check, ChevronDown, Tag, MapPin, Clock, XCircle, Ticket, QrCode, RefreshCw, CheckCircle2, Sparkles, CalendarDays, Timer, ArrowUpDown, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG = {
  active: {
    label: "Aktif",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: CheckCircle2,
    description: "Tiket siap digunakan"
  },
  used: {
    label: "Digunakan",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    dotColor: "bg-blue-500",
    icon: Check,
    description: "Tiket sudah di check-in"
  },
  expired: {
    label: "Kadaluarsa",
    bgColor: "bg-slate-100",
    textColor: "text-slate-600",
    borderColor: "border-slate-300",
    dotColor: "bg-slate-400",
    icon: Timer,
    description: "Event sudah berakhir"
  }
};

export default function TiketSaya() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();
  
  const [expandedEvents, setExpandedEvents] = useState({});
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  
  const [editingTag, setEditingTag] = useState({});
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketAPI.getTickets();
      
      let ticketData = response.data;
      if (ticketData && ticketData.data && Array.isArray(ticketData.data)) {
        ticketData = ticketData.data;
      } else if (!Array.isArray(ticketData)) {
        ticketData = [];
      }
      
      setTickets(ticketData);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Gagal memuat tiket");
      showNotification("Gagal memuat tiket", "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "-";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting time:", dateString, error);
      return "";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
  };

  const formatDateRange = (startDate, endDate) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    if (start === end || end === "-") return start;
    return `${start} - ${end}`;
  };

  const formatTimeRange = (startDate, endDate) => {
    const start = formatTime(startDate);
    const end = formatTime(endDate);
    if (!start || !end) return "-";
    return `${start} - ${end}`;
  };

  const computeStatus = (ticket) => {
    if (ticket.status === "pending" || ticket.status === "cancelled") {
      return null;
    }
    
    if (ticket.status === "used") {
      return "used";
    }
    
    const eventEnd = ticket.event?.date_end || ticket.ticket_category?.date_time_end;
    if (eventEnd && new Date(eventEnd) < new Date()) {
      return "expired";
    }
    
    return "active";
  };

  const processedTickets = useMemo(() => {
    return tickets
      .map(ticket => {
        const status = computeStatus(ticket);
        if (!status) return null;

        // Prioritize ticket category dates, fallback to event dates
        const startDate = ticket.ticket_category?.date_time_start || ticket.event?.date_start;
        const endDate = ticket.ticket_category?.date_time_end || ticket.event?.date_end;

        return {
          ...ticket,
          ticketId: ticket.ticket_id,
          code: ticket.code,
          tag: ticket.tag || "",
          status: status,
          usedAt: ticket.used_at,
          createdAt: ticket.created_at,
          
          eventName: ticket.event?.name || ticket.event?.event_name || "Event",
          eventVenue: ticket.event?.venue || ticket.event?.Venue || ticket.event?.location || "-",
          eventLocation: ticket.event?.location || "-",
          eventCity: ticket.event?.city || "-",
          eventDateStart: ticket.event?.date_start,
          eventDateEnd: ticket.event?.date_end,
          eventImage: ticket.event?.image,
          eventId: ticket.event?.event_id,
          
          categoryName: ticket.ticket_category?.name || "Tiket",
          categoryPrice: ticket.ticket_category?.price || 0,
          categoryDescription: ticket.ticket_category?.description || "",
          ticketDateStart: startDate,
          ticketDateEnd: endDate,
          
          formattedEventDate: formatDate(ticket.event?.date_start),
          formattedEventDateEnd: formatDate(ticket.event?.date_end),
          formattedTicketDate: formatDate(startDate),
          formattedTicketDateEnd: formatDate(endDate),
          timeRange: formatTimeRange(startDate, endDate),
          
          // Additional formatted dates for display
          displayDate: formatDate(startDate),
          displayDateRange: formatDateRange(startDate, endDate),
          displayTimeRange: formatTimeRange(startDate, endDate)
        };
      })
      .filter(ticket => ticket !== null);
  }, [tickets]);

  const statusStats = useMemo(() => {
    const stats = {
      all: processedTickets.length,
      active: 0,
      used: 0,
      expired: 0
    };
    
    processedTickets.forEach(ticket => {
      if (stats[ticket.status] !== undefined) {
        stats[ticket.status]++;
      }
    });
    
    return stats;
  }, [processedTickets]);

  const filteredTickets = useMemo(() => {
    let filtered = [...processedTickets];

    if (selectedStatus !== "all") {
      filtered = filtered.filter(ticket => ticket.status === selectedStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.eventName?.toLowerCase().includes(term) ||
        ticket.categoryName?.toLowerCase().includes(term) ||
        ticket.tag?.toLowerCase().includes(term) ||
        ticket.code?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [processedTickets, selectedStatus, searchTerm]);

  const groupedByEvent = useMemo(() => {
    const groups = {};
    
    filteredTickets.forEach(ticket => {
      const eventKey = ticket.eventId || ticket.eventName || "unknown";
      
      if (!groups[eventKey]) {
        groups[eventKey] = {
          eventId: ticket.eventId,
          eventName: ticket.eventName,
          eventVenue: ticket.eventVenue,
          eventLocation: ticket.eventLocation,
          eventCity: ticket.eventCity,
          eventDateStart: ticket.eventDateStart,
          eventDateEnd: ticket.eventDateEnd,
          eventImage: ticket.eventImage,
          formattedEventDate: ticket.formattedEventDate,
          formattedEventDateEnd: ticket.formattedEventDateEnd,
          displayDateRange: ticket.displayDateRange,
          tickets: []
        };
      }
      
      groups[eventKey].tickets.push(ticket);
    });

    let sortedGroups = Object.values(groups);
    sortedGroups.sort((a, b) => {
      let compareResult = 0;
      switch (sortBy) {
        case "date":
          compareResult = new Date(a.eventDateStart || 0) - new Date(b.eventDateStart || 0);
          break;
        case "name":
          compareResult = (a.eventName || "").localeCompare(b.eventName || "");
          break;
        default:
          compareResult = new Date(a.eventDateStart || 0) - new Date(b.eventDateStart || 0);
      }
      return sortOrder === "desc" ? -compareResult : compareResult;
    });

    return sortedGroups;
  }, [filteredTickets, sortBy, sortOrder]);

  const toggleEventDropdown = (eventName) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventName]: !prev[eventName]
    }));
  };

  const handleShowQR = (ticket) => {
    setSelectedTicket(ticket);
    setShowQRDialog(true);
  };

  const handleCloseQR = () => {
    setShowQRDialog(false);
    setSelectedTicket(null);
  };

  const startEditingTag = (ticketId, currentTag, e) => {
    e?.stopPropagation();
    setEditingTag({ [ticketId]: true });
    setTagInput(currentTag || "");
  };

  const updateTicketTag = async (ticketId, newTag) => {
    try {
      await ticketAPI.updateTagTicket(ticketId, { tag: newTag });
      showNotification("Catatan tiket berhasil diperbarui", "Sukses", "success");
      
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.ticket_id === ticketId 
            ? { ...ticket, tag: newTag }
            : ticket
        )
      );
    } catch (err) {
      console.error("Error updating ticket tag:", err);
      showNotification("Gagal memperbarui catatan tiket", "Error", "error");
    }
  };

  const saveTag = (ticketId, e) => {
    e?.stopPropagation();
    updateTicketTag(ticketId, tagInput.trim());
    setEditingTag({ [ticketId]: false });
    setTagInput("");
  };

  const cancelEditing = (ticketId, e) => {
    e?.stopPropagation();
    setEditingTag(prev => ({ ...prev, [ticketId]: false }));
    setTagInput("");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    showNotification("Filter berhasil direset", "Info", "info");
  };

  const hasActiveFilters = searchTerm || selectedStatus !== "all";

  const StatusBadge = ({ status, size = "sm" }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.active;
    
    const sizeClasses = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-xs"
    };

    return (
      <span className={`
        inline-flex items-center gap-1 font-medium rounded-full
        ${config.bgColor} ${config.textColor} ${config.borderColor} border
        ${sizeClasses[size]}
      `}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"
            />
            <p className="mt-6 text-slate-600 font-medium">Memuat tiket Anda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full text-center border border-red-100"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-slate-600 mb-6 text-sm">{error}</p>
            <motion.button
              onClick={fetchTickets}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium"
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw size={16} className="inline mr-2" />
              Coba Lagi
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (processedTickets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] p-4 pt-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Tiket</h3>
            <p className="text-slate-600 mb-6 text-sm">Anda belum memiliki tiket. Jelajahi event menarik sekarang!</p>
            <motion.button
              onClick={() => navigate('/cariEvent')}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium"
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles size={16} className="inline mr-2" />
              Jelajahi Event
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-15 bg-gray-100">
      <Navbar />
      
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div className="pt-20 pb-8 md:pt-24 md:pb-12">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8"
          >
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3"
            >
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  Tiket Saya
                </h1>
                <p className="text-gray-600 text-sm mt-1 hidden sm:block">
                  Kelola semua tiket event Anda di satu tempat
                </p>
              </div>
              
              <motion.button
                onClick={fetchTickets}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
            </motion.div>

            {/* Filter Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mb-6"
            >
              {/* Status Tabs - Scrollable on mobile */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {[
                  { key: "all", label: "Semua", count: statusStats.all },
                  { key: "active", label: "Aktif", count: statusStats.active },
                  { key: "used", label: "Digunakan", count: statusStats.used },
                  { key: "expired", label: "Kadaluarsa", count: statusStats.expired }
                ].filter(tab => tab.key === "all" || tab.count > 0).map((tab) => (
                  <motion.button
                    key={tab.key}
                    onClick={() => setSelectedStatus(tab.key)}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0
                      ${selectedStatus === tab.key 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                    `}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tab.key !== "all" && STATUS_CONFIG[tab.key] && (
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        selectedStatus === tab.key ? 'bg-white' : STATUS_CONFIG[tab.key].dotColor
                      }`} />
                    )}
                    {tab.label}
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                      selectedStatus === tab.key ? 'bg-white/20' : 'bg-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Search and Sort */}
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Cari event, tiket, atau kode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="date">Tanggal Event</option>
                    <option value="name">Nama Event</option>
                  </select>
                  
                  <motion.button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="px-3 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowUpDown size={18} className={`text-gray-600 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                  </motion.button>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-200"
                >
                  <span className="text-xs text-gray-500">Filter:</span>
                  {selectedStatus !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {STATUS_CONFIG[selectedStatus]?.label}
                      <button onClick={() => setSelectedStatus("all")}><X size={12} /></button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                      "{searchTerm.length > 10 ? searchTerm.slice(0, 10) + '...' : searchTerm}"
                      <button onClick={() => setSearchTerm("")}><X size={12} /></button>
                    </span>
                  )}
                  <button onClick={clearFilters} className="text-xs text-red-600 hover:text-red-700 font-medium ml-auto">
                    Reset
                  </button>
                </motion.div>
              )}
            </motion.div>

            {/* Results Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-4"
            >
              <p className="text-gray-600 text-sm">
                <span className="font-semibold text-gray-800">{filteredTickets.length}</span> tiket
                {" "}dari <span className="font-semibold text-gray-800">{groupedByEvent.length}</span> event
              </p>
            </motion.div>

            {/* Events List with Dropdown */}
            <div className="space-y-3">
              {groupedByEvent.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center"
                >
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Tidak Ada Tiket</h3>
                  <p className="text-gray-600 text-sm mb-4">Tidak ada tiket yang sesuai dengan filter</p>
                  <motion.button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                    whileTap={{ scale: 0.98 }}
                  >
                    Reset Filter
                  </motion.button>
                </motion.div>
              ) : (
                groupedByEvent.map((eventGroup, index) => (
                  <motion.div
                    key={eventGroup.eventId || eventGroup.eventName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    {/* Event Header - Clickable */}
                    <div
                      onClick={() => toggleEventDropdown(eventGroup.eventName)}
                      className="p-3 sm:p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {eventGroup.eventImage && (
                            <img 
                              src={eventGroup.eventImage} 
                              alt={eventGroup.eventName}
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover shadow-sm flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 line-clamp-2">{eventGroup.eventName}</h3>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin size={12} className="text-blue-600 flex-shrink-0" />
                                <span className="truncate max-w-[100px] sm:max-w-none">{eventGroup.eventVenue}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarDays size={12} className="text-purple-600 flex-shrink-0" />
                                <span>{eventGroup.displayDateRange || formatDateRange(eventGroup.eventDateStart, eventGroup.eventDateEnd)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Ticket size={12} className="text-emerald-600 flex-shrink-0" />
                                <span>{eventGroup.tickets.length} tiket</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expand button */}
                        <motion.div
                          className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg flex-shrink-0"
                          animate={{ rotate: expandedEvents[eventGroup.eventName] ? 180 : 0 }}
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      </div>
                    </div>

                    {/* Dropdown Content */}
                    <AnimatePresence>
                      {expandedEvents[eventGroup.eventName] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-200 bg-gray-50/50 overflow-hidden"
                        >
                          <div className="p-3 sm:p-4 md:p-6 space-y-3">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                              <Info size={16} />
                              Detail Tiket ({eventGroup.tickets.length})
                            </h4>
                            
                            {eventGroup.tickets.map((ticket, ticketIndex) => {
                              const config = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.active;
                              
                              return (
                                <motion.div
                                  key={ticket.ticketId}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: ticketIndex * 0.05 }}
                                  className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4"
                                >
                                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                    {/* Left Section - Ticket Info */}
                                    <div className="flex-1">
                                      {/* Ticket Info Header */}
                                      <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <StatusBadge status={ticket.status} size="md" />
                                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                          {ticket.categoryName}
                                        </span>
                                      </div>
                                      
                                      {/* Ticket Details */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                          <CalendarDays size={12} className="text-blue-600" />
                                          <span>{ticket.displayDateRange || formatDateRange(ticket.ticketDateStart, ticket.ticketDateEnd)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                          <Clock size={12} className="text-purple-600" />
                                          <span>{ticket.displayTimeRange || formatTimeRange(ticket.ticketDateStart, ticket.ticketDateEnd)}</span>
                                        </div>
                                      </div>

                                      {/* Used At Info */}
                                      {ticket.status === "used" && ticket.usedAt && (
                                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200 mb-3">
                                          <CheckCircle2 size={12} className="text-blue-600" />
                                          <span className="text-xs text-blue-700">
                                            Check-in: {formatDateTime(ticket.usedAt)}
                                          </span>
                                        </div>
                                      )}

                                      {/* Personal Note */}
                                      <div className="pt-2 border-t border-gray-200">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                          <Tag size={12} className="text-gray-500" />
                                          <span className="text-xs font-medium text-gray-700">Catatan:</span>
                                        </div>
                                        {editingTag[ticket.ticketId] ? (
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="text"
                                              value={tagInput}
                                              onChange={(e) => setTagInput(e.target.value)}
                                              className="flex-1 text-xs px-2.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                              placeholder="Tulis catatan..."
                                              maxLength={100}
                                              autoFocus
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveTag(ticket.ticketId, e);
                                                if (e.key === 'Escape') cancelEditing(ticket.ticketId, e);
                                              }}
                                            />
                                            <button onClick={(e) => saveTag(ticket.ticketId, e)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                              <Check size={16} />
                                            </button>
                                            <button onClick={(e) => cancelEditing(ticket.ticketId, e)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                                              <X size={16} />
                                            </button>
                                          </div>
                                        ) : (
                                          <div
                                            onClick={(e) => startEditingTag(ticket.ticketId, ticket.tag, e)}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                                              ticket.tag ? 'bg-blue-50 border border-blue-200' : 'bg-gray-100 border border-dashed border-gray-300'
                                            }`}
                                          >
                                            <span className={`text-xs ${ticket.tag ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                              {ticket.tag || "Tambahkan catatan..."}
                                            </span>
                                            <Pencil size={12} className="text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Right Section - QR Button (Desktop) */}
                                    <div className="lg:w-auto lg:flex lg:items-center">
                                      {(ticket.status === "active" || ticket.status === "used") ? (
                                        <motion.button
                                          onClick={() => handleShowQR(ticket)}
                                          className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 lg:min-w-[140px]"
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <QrCode size={18} />
                                          <span className="lg:hidden">Tampilkan QR</span>
                                          <span className="hidden lg:inline">QR Code</span>
                                        </motion.button>
                                      ) : (
                                        <div className={`w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${config.bgColor} ${config.textColor} lg:min-w-[140px]`}>
                                          {ticket.status === "expired" && <Timer size={16} />}
                                          <span>{config.label}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* QR Code Dialog */}
      <AnimatePresence>
        {showQRDialog && selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
            onClick={handleCloseQR}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 sm:p-6 bg-white border-b border-gray-200">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{selectedTicket.eventName}</h3>
                    <p className="text-gray-600 text-sm mt-1">{selectedTicket.categoryName}</p>
                  </div>
                  <motion.button
                    onClick={handleCloseQR}
                    className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>
                {selectedTicket.status === "used" && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200 mt-3">
                    <CheckCircle2 size={14} className="text-blue-600" />
                    <span className="text-xs text-blue-700">Tiket sudah digunakan</span>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center p-4 bg-white rounded-xl border-2 border-dashed border-gray-200 mb-4"
                >
                  <QRCodeGenerator 
                    value={selectedTicket.code}
                    size={180}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#000000"
                    includeMargin={true}
                  />
                </motion.div>

                <p className="text-center text-gray-500 text-xs mb-4">
                  {selectedTicket.status === "used" 
                    ? "QR Code ini sudah digunakan untuk check-in"
                    : "Tunjukkan QR code ini kepada petugas saat masuk venue"
                  }
                </p>

                {/* Ticket Details */}
                <div className="space-y-2 bg-gray-50 rounded-xl p-3 mb-4">
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <span className="text-gray-600 text-xs">Kode Tiket</span>
                    <span className="font-mono font-bold text-blue-600 text-sm">{selectedTicket.code}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <span className="text-gray-600 text-xs">Tanggal Event</span>
                    <span className="font-medium text-xs">{selectedTicket.displayDateRange}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <span className="text-gray-600 text-xs">Waktu</span>
                    <span className="font-medium text-xs">{selectedTicket.displayTimeRange}</span>
                  </div>
                  <div className="flex justify-between items-start py-1.5 border-b border-gray-200">
                    <span className="text-gray-600 text-xs">Venue</span>
                    <span className="font-medium text-xs text-right max-w-[160px]">{selectedTicket.eventVenue}</span>
                  </div>
                  {selectedTicket.tag && (
                    <div className="flex justify-between items-start py-1.5">
                      <span className="text-gray-600 text-xs">Catatan</span>
                      <span className="font-medium text-xs text-right max-w-[160px]">{selectedTicket.tag}</span>
                    </div>
                  )}
                </div>

                <motion.button
                  onClick={handleCloseQR}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
                  whileTap={{ scale: 0.98 }}
                >
                  Tutup
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}