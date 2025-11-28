import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";
import { transactionAPI } from "../services/api";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  ChevronDown, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Info,
  X,
  Search,
  RefreshCw,
  Ticket,
  Receipt,
  Timer,
  Ban,
  ArrowUpDown,
  Sparkles,
  Tag,
  Pencil,
  Check,
  QrCode,
  CheckCircle2,
  CalendarDays
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG = {
  paid: {
    label: "Berhasil",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: CheckCircle
  },
  pending: {
    label: "Menunggu Pembayaran",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    dotColor: "bg-amber-500",
    icon: Clock
  },
  failed: {
    label: "Gagal",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    dotColor: "bg-red-500",
    icon: XCircle
  },
  expired: {
    label: "Kadaluarsa",
    bgColor: "bg-slate-100",
    textColor: "text-slate-600",
    borderColor: "border-slate-300",
    dotColor: "bg-slate-400",
    icon: Timer
  },
  cancelled: {
    label: "Dibatalkan",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    dotColor: "bg-red-500",
    icon: Ban
  }
};

export default function RiwayatTransaksi() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();
  
  const [expandedTransactions, setExpandedTransactions] = useState({});
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionAPI.getTransactionHistory();
      
      if (response.data && response.data.transactions) {
        const transformedTransactions = response.data.transactions.map(transaction => ({
          transactionId: transaction.transaction_id,
          transactionDate: new Date(transaction.transaction_time).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          transactionTime: transaction.transaction_time,
          transactionDateTime: new Date(transaction.transaction_time),
          totalAmount: transaction.price_total,
          status: transaction.transaction_status,
          statusLabel: getStatusLabel(transaction.transaction_status),
          linkPayment: transaction.link_payment,
          events: transaction.events?.map(event => ({
            id: event.event_id,
            eventName: event.event_name,
            address: event.location,
            city: event.city,
            venue: event.venue,
            startDate: new Date(event.date_start).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            endDate: new Date(event.date_end).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            image: event.image,
            eventSubtotal: event.event_subtotal,
            details: groupTicketsByCategory(event.ticket_details)
          })) || []
        }));
        
        setTransactions(transformedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err.response?.data?.error || "Gagal mengambil data transaksi");
      showNotification("Gagal mengambil data transaksi", "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  const groupTicketsByCategory = (ticketDetails) => {
    if (!ticketDetails || ticketDetails.length === 0) return [];
    
    const grouped = {};
    
    ticketDetails.forEach(ticket => {
      const key = ticket.ticket_category_id;
      
      if (!grouped[key]) {
        grouped[key] = {
          type: ticket.category_name,
          description: ticket.description,
          price: ticket.price,
          startDate: new Date(ticket.date_time_start).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          endDate: new Date(ticket.date_time_end).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          dateTimeStart: ticket.date_time_start,
          dateTimeEnd: ticket.date_time_end,
          ticketCategoryId: ticket.ticket_category_id,
          quantity: 0,
          tickets: []
        };
      }
      
      grouped[key].quantity += 1;
      grouped[key].tickets.push({
        ticketId: ticket.ticket_id,
        code: ticket.code,
        status: ticket.status
      });
    });
    
    return Object.values(grouped);
  };

  const getStatusLabel = (status) => {
    return STATUS_CONFIG[status]?.label || status;
  };

  const formatDateRange = (startDate, endDate) => {
    if (startDate === endDate) return startDate;
    return `${startDate} - ${endDate}`;
  };

  const formatTimeRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startTime = start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    return `${startTime} - ${endTime}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const statusStats = useMemo(() => {
    const stats = {
      all: transactions.length,
      paid: 0,
      pending: 0,
      failed: 0,
      expired: 0,
      cancelled: 0
    };
    
    transactions.forEach(t => {
      if (stats[t.status] !== undefined) {
        stats[t.status]++;
      }
    });
    
    return stats;
  }, [transactions]);

  const totalSpent = useMemo(() => {
    return transactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.totalAmount, 0);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (selectedStatus !== "all") {
      filtered = filtered.filter(t => t.status === selectedStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.transactionId.toLowerCase().includes(term) ||
        t.events.some(e => e.eventName.toLowerCase().includes(term))
      );
    }

    filtered.sort((a, b) => {
      let compareResult = 0;
      switch (sortBy) {
        case "date":
          compareResult = a.transactionDateTime - b.transactionDateTime;
          break;
        case "amount":
          compareResult = a.totalAmount - b.totalAmount;
          break;
        case "status":
          compareResult = a.status.localeCompare(b.status);
          break;
        default:
          compareResult = a.transactionDateTime - b.transactionDateTime;
      }
      return sortOrder === "desc" ? -compareResult : compareResult;
    });

    return filtered;
  }, [transactions, selectedStatus, searchTerm, sortBy, sortOrder]);

  const toggleTransactionDropdown = (transactionId) => {
    setExpandedTransactions(prev => ({
      ...prev,
      [transactionId]: !prev[transactionId]
    }));
  };

  const handleShowDetail = (transaction, event, detail) => {
    setSelectedTicket({ transaction, event, detail });
    setShowDetailDialog(true);
  };

  const handleCloseDetail = () => {
    setShowDetailDialog(false);
    setSelectedTicket(null);
  };

  const calculateEventTotal = (event) => {
    if (event.eventSubtotal !== undefined && event.eventSubtotal !== null) {
      return event.eventSubtotal;
    }
    return event.details.reduce((total, detail) => total + (detail.price * detail.quantity), 0);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    showNotification("Filter berhasil direset", "Info", "info");
  };

  const hasActiveFilters = searchTerm || selectedStatus !== "all";

  const StatusBadge = ({ status, size = "sm" }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    
    const sizeClasses = {
      sm: "px-2.5 py-1 text-xs",
      md: "px-3 py-1.5 text-sm"
    };

    return (
      <span className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${config.bgColor} ${config.textColor} ${config.borderColor} border
        ${sizeClasses[size]}
      `}>
        <Icon size={14} />
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
            <p className="mt-6 text-slate-600 font-medium">Memuat riwayat transaksi...</p>
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
            className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-red-100"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Terjadi Kesalahan</h3>
            <p className="text-slate-600 mb-8">{error}</p>
            <motion.button
              onClick={fetchTransactions}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw size={18} className="inline mr-2" />
              Coba Lagi
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Belum Ada Transaksi</h3>
            <p className="text-slate-600 mb-8">Anda belum memiliki riwayat pembelian tiket</p>
            <motion.button
              onClick={() => navigate('/cariEvent')}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles size={18} className="inline mr-2" />
              Jelajahi Event
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
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
                  Riwayat Pembelian
                </h1>
                <p className="text-gray-600 mt-2">
                  Semua transaksi pembelian tiket Anda
                </p>
              </div>
              
              <motion.button
                onClick={fetchTransactions}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </motion.button>
            </motion.div>


            {/* Filter Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-50 rounded-xl p-6 mb-8"
            >
              {/* Status Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { key: "all", label: "Semua", count: statusStats.all },
                  { key: "paid", label: "Berhasil", count: statusStats.paid },
                  { key: "pending", label: "Menunggu", count: statusStats.pending },
                  { key: "failed", label: "Gagal", count: statusStats.failed },
                  { key: "expired", label: "Kadaluarsa", count: statusStats.expired }
                ].filter(tab => tab.key === "all" || tab.count > 0).map((tab) => (
                  <motion.button
                    key={tab.key}
                    onClick={() => setSelectedStatus(tab.key)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                      ${selectedStatus === tab.key 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tab.key !== "all" && STATUS_CONFIG[tab.key] && (
                      <span className={`w-2 h-2 rounded-full ${
                        selectedStatus === tab.key ? 'bg-white' : STATUS_CONFIG[tab.key].dotColor
                      }`} />
                    )}
                    {tab.label}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      selectedStatus === tab.key ? 'bg-white/20' : 'bg-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Search and Sort */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan ID transaksi atau nama event..."
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

                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white min-w-[150px]"
                  >
                    <option value="date">Tanggal</option>
                    <option value="amount">Jumlah</option>
                    <option value="status">Status</option>
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

              {/* Active Filters */}
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200"
                >
                  <span className="text-sm text-gray-500">Filter aktif:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedStatus !== "all" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        Status: {STATUS_CONFIG[selectedStatus]?.label}
                        <button onClick={() => setSelectedStatus("all")}><X size={14} /></button>
                      </span>
                    )}
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        "{searchTerm}"
                        <button onClick={() => setSearchTerm("")}><X size={14} /></button>
                      </span>
                    )}
                  </div>
                  <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700 font-medium ml-auto">
                    Reset Semua
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
                Menampilkan <span className="font-semibold text-gray-800">{filteredTransactions.length}</span> transaksi
              </p>
              <p className="text-lg font-bold text-gray-900">
                Total Belanja: <span className="text-blue-600">{formatCurrency(totalSpent)}</span>
              </p>
            </motion.div>

            {/* Transactions List */}
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center"
                >
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak Ada Transaksi Ditemukan</h3>
                  <p className="text-gray-600 mb-6">Tidak ada transaksi yang sesuai dengan filter</p>
                  <motion.button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Reset Filter
                  </motion.button>
                </motion.div>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.transactionId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    {/* Transaction Header - Clickable */}
                    <div
                      onClick={() => toggleTransactionDropdown(transaction.transactionId)}
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Receipt size={24} className="text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">Transaksi #{transaction.transactionId.slice(-8).toUpperCase()}</h3>
                              <StatusBadge status={transaction.status} size="sm" />
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <CalendarDays size={14} className="text-blue-600" />
                                <span>{transaction.transactionDate}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock size={14} className="text-purple-600" />
                                <span>
                                  {new Date(transaction.transactionDateTime).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <DollarSign size={14} className="text-emerald-600" />
                                <span>{formatCurrency(transaction.totalAmount)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Ticket size={14} className="text-amber-600" />
                                <span>{transaction.events.length} event</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <motion.button
                          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span>Detail</span>
                          <motion.div animate={{ rotate: expandedTransactions[transaction.transactionId] ? 180 : 0 }}>
                            <ChevronDown size={18} />
                          </motion.div>
                        </motion.button>
                      </div>
                    </div>

                    {/* Dropdown Content */}
                    <AnimatePresence>
                      {expandedTransactions[transaction.transactionId] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-200 bg-gray-50/50 overflow-hidden"
                        >
                          <div className="p-6 space-y-6">
                            {/* Payment Link for Pending */}
                            {transaction.status === 'pending' && transaction.linkPayment && (
                              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <AlertCircle size={20} className="text-amber-600 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-amber-700 font-medium">Menunggu Pembayaran</p>
                                  <p className="text-amber-600 text-sm">Selesaikan pembayaran sebelum waktu habis</p>
                                </div>
                                <motion.a
                                  href={transaction.linkPayment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <ExternalLink size={16} />
                                  Bayar Sekarang
                                </motion.a>
                              </div>
                            )}

                            {/* Events List */}
                            <div>
                              <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                <Info size={18} />
                                Detail Event ({transaction.events.length})
                              </h4>
                              
                              <div className="space-y-4">
                                {transaction.events.map((event, eventIndex) => (
                                  <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: eventIndex * 0.05 }}
                                    className="bg-white rounded-lg border border-gray-200 p-5"
                                  >
                                    <div className="flex items-start gap-4 mb-4">
                                      {event.image && (
                                        <img 
                                          src={event.image} 
                                          alt={event.eventName}
                                          className="w-16 h-16 rounded-lg object-cover shadow-sm flex-shrink-0"
                                        />
                                      )}
                                      <div className="flex-1">
                                        <h5 className="font-bold text-gray-900 mb-2">{event.eventName}</h5>
                                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                          <div className="flex items-center gap-1.5">
                                            <MapPin size={14} className="text-blue-600" />
                                            <span>{event.venue || event.address}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <CalendarDays size={14} className="text-purple-600" />
                                            <span>{formatDateRange(event.startDate, event.endDate)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Ticket Details */}
                                    <div className="pt-4 border-t border-gray-200">
                                      <div className="space-y-3">
                                        {event.details.map((detail, detailIndex) => (
                                          <div key={detailIndex} className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-2">
                                              <div>
                                                <h6 className="font-semibold text-gray-800">{detail.type}</h6>
                                                <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-1">
                                                  <div className="flex items-center gap-1">
                                                    <CalendarDays size={12} className="text-blue-600" />
                                                    <span>{formatDateRange(detail.startDate, detail.endDate)}</span>
                                                  </div>
                                                  <div className="flex items-center gap-1">
                                                    <Clock size={12} className="text-purple-600" />
                                                    <span>{formatTimeRange(detail.dateTimeStart, detail.dateTimeEnd)}</span>
                                                  </div>
                                                </div>
                                              </div>
                                              
                                              {detail.tickets && detail.tickets.length > 0 && (
                                                <motion.button
                                                  onClick={() => handleShowDetail(transaction, event, detail)}
                                                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                                                  whileHover={{ scale: 1.05 }}
                                                  whileTap={{ scale: 0.95 }}
                                                >
                                                  <Info size={12} />
                                                  Detail Tiket
                                                </motion.button>
                                              )}
                                            </div>
                                            
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                              <span className="text-sm text-gray-600">
                                                {detail.quantity} tiket × {formatCurrency(detail.price)}
                                              </span>
                                              <span className="font-bold text-gray-900">
                                                {formatCurrency(detail.price * detail.quantity)}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            {/* Transaction Summary */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                <span className="text-blue-800 font-semibold">Total Transaksi:</span>
                                <span className="text-blue-800 font-bold text-xl">
                                  {formatCurrency(transaction.totalAmount)}
                                </span>
                              </div>
                            </div>
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

      {/* Detail Dialog */}
      <AnimatePresence>
        {showDetailDialog && selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseDetail}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 bg-white border-b border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedTicket.event.eventName}</h3>
                    <p className="text-gray-600 mt-1">{selectedTicket.detail.type}</p>
                  </div>
                  <motion.button
                    onClick={handleCloseDetail}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </div>

              <div className="p-6">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-xs block mb-1">Transaction ID</span>
                    <span className="font-mono font-semibold text-sm">{selectedTicket.transaction.transactionId.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-xs block mb-1">Kategori</span>
                    <span className="font-semibold text-sm">{selectedTicket.detail.type}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-xs block mb-1">Harga</span>
                    <span className="font-semibold text-sm">{formatCurrency(selectedTicket.detail.price)}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-xs block mb-1">Quantity</span>
                    <span className="font-semibold text-sm">{selectedTicket.detail.quantity}</span>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800 font-semibold">Subtotal:</span>
                    <span className="text-blue-800 font-bold text-lg">
                      {formatCurrency(selectedTicket.detail.price * selectedTicket.detail.quantity)}
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 text-sm">Tanggal Event:</span>
                    <span className="font-semibold text-sm">
                      {formatDateRange(selectedTicket.detail.startDate, selectedTicket.detail.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 text-sm">Waktu:</span>
                    <span className="font-semibold text-sm">
                      {formatTimeRange(selectedTicket.detail.dateTimeStart, selectedTicket.detail.dateTimeEnd)}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2 border-b border-gray-200">
                    <span className="text-gray-600 text-sm">Venue:</span>
                    <span className="font-semibold text-sm text-right max-w-[180px]">
                      {selectedTicket.event.venue || selectedTicket.event.address}
                    </span>
                  </div>
                </div>

                {/* Ticket List */}
                {selectedTicket.detail.tickets && selectedTicket.detail.tickets.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Ticket size={18} />
                      Daftar Tiket ({selectedTicket.detail.tickets.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedTicket.detail.tickets.map((ticket, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600 text-xs">Tiket #{idx + 1}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              ticket.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                              ticket.status === 'used' ? 'bg-gray-100 text-gray-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {ticket.status === 'active' ? 'Aktif' : 
                               ticket.status === 'used' ? 'Sudah Digunakan' : ticket.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">ID:</span>
                              <span className="font-mono ml-1">{ticket.ticketId?.slice(-8)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Code:</span>
                              <span className="font-mono ml-1 font-medium">{ticket.code}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <motion.button
                  onClick={handleCloseDetail}
                  className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
                  whileHover={{ scale: 1.02 }}
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