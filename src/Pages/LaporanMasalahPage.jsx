import { useState, useMemo, useEffect } from "react";
import Navbar from "../components/Navbar";
import { feedbackAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";
import { 
  Eye, 
  Search, 
  Filter, 
  X, 
  RefreshCw, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LaporanMasalahPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const { notification, showNotification, hideNotification } = useNotification();

  const [showFilters, setShowFilters] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [detailModal, setDetailModal] = useState({
    open: false,
    data: null,
    responseInput: "",
  });

  // Fungsi untuk format waktu relatif
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} detik yang lalu`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} menit yang lalu`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} hari yang lalu`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} minggu yang lalu`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} bulan yang lalu`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} tahun yang lalu`;
  };

  // Fetch all feedback on component mount
  useEffect(() => {
    fetchAllFeedback();
  }, []);

  const fetchAllFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackAPI.getAllFeedback();
      const sortedFeedback = (response.data.feedback || []).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setReports(sortedFeedback);
    } catch (err) {
      showNotification(
        err.response?.data?.error || "Gagal memuat laporan",
        "Error",
        "error"
      );
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAllFeedback();
    showNotification("Data diperbarui", "Sukses", "success");
  };

  const openDetail = (report) => {
    setDetailModal({
      open: true,
      data: report,
      responseInput: report.reply || "",
    });
  };

  const updateFeedbackStatus = async (status) => {
    if (!detailModal.data) return;

    try {
      setUpdating(true);
      
      const formData = {
        status: status,
        reply: detailModal.responseInput.trim() || ""
      };

      await feedbackAPI.updateFeedbackStatus(detailModal.data.feedback_id, formData);

      showNotification("Status laporan berhasil diupdate!", "Sukses", "success");
      
      await fetchAllFeedback();
      
      setDetailModal({ open: false, data: null, responseInput: "" });
      
    } catch (err) {
      showNotification(
        err.response?.data?.error || "Gagal mengupdate status",
        "Error",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  // Status mapping untuk UI
  const statusMapping = {
    "waiting": { 
      label: "Menunggu", 
      class: "bg-amber-50 text-amber-700 border border-amber-200",
      icon: Clock
    },
    "processed": { 
      label: "Diproses", 
      class: "bg-blue-50 text-blue-700 border border-blue-200",
      icon: AlertCircle
    },
    "completed": { 
      label: "Diterima", 
      class: "bg-green-50 text-green-700 border border-green-200",
      icon: CheckCircle
    },
    "rejected": { 
      label: "Ditolak", 
      class: "bg-red-50 text-red-700 border border-red-200",
      icon: XCircle
    }
  };

  const getStatusBadge = (status) => {
    const config = statusMapping[status] || statusMapping.waiting;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.class}`}>
        <IconComponent size={14} />
        {config.label}
      </span>
    );
  };

  // Ambil daftar kategori unik untuk dropdown
  const categoryOptions = useMemo(() => {
    const categories = [...new Set(reports.map((r) => r.feedback_category))];
    return categories;
  }, [reports]);

  // Stats
  const waitingReports = reports.filter(r => r.status === "waiting");
  const processedReports = reports.filter(r => r.status === "processed");
  const completedReports = reports.filter(r => r.status === "completed");

  // ===== FILTERING LOGIC =====
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchUser =
        searchUser === "" ||
        r.user?.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
        r.user?.email?.toLowerCase().includes(searchUser.toLowerCase());

      const matchStatus =
        statusFilter === "all" || r.status === statusFilter;

      const matchCategory =
        categoryFilter === "all" || r.feedback_category === categoryFilter;

      return matchUser && matchStatus && matchCategory;
    });
  }, [reports, searchUser, statusFilter, categoryFilter]);

  const clearFilters = () => {
    setSearchUser("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  const hasActiveFilters = searchUser || statusFilter !== "all" || categoryFilter !== "all";

  const getStatusText = (status) => {
    return statusMapping[status]?.label || status;
  };

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

      {/* Modal Detail */}
      <AnimatePresence>
        {detailModal.open && detailModal.data && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  Detail Laporan
                </h2>
                <button
                  onClick={() => setDetailModal({ open: false, data: null, responseInput: "" })}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Kategori:</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {detailModal.data.feedback_category}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Pengirim</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900">{detailModal.data.user?.name || "Unknown"}</p>
                    <p className="text-sm text-gray-500">{detailModal.data.user?.email || "No email"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Status Saat Ini</p>
                  {getStatusBadge(detailModal.data.status)}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Deskripsi Masalah</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {detailModal.data.comment}
                    </p>
                  </div>
                </div>

                {detailModal.data.image && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Bukti Lampiran</p>
                    <a
                      href={detailModal.data.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Eye size={16} />
                      Lihat Gambar
                    </a>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Tanggapan Admin</p>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    rows={4}
                    value={detailModal.responseInput}
                    onChange={(e) =>
                      setDetailModal((prev) => ({
                        ...prev,
                        responseInput: e.target.value,
                      }))
                    }
                    placeholder="Tulis tanggapan admin..."
                  />
                </div>
              </div>

              <div className="flex justify-between gap-3 p-6 border-t border-gray-100 bg-gray-50">
                <motion.button
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  onClick={() => setDetailModal({ open: false, data: null, responseInput: "" })}
                  disabled={updating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Batal
                </motion.button>
                <div className="flex gap-2">
                  <motion.button
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                    onClick={() => updateFeedbackStatus("rejected")}
                    disabled={updating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Tolak
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    className="px-5 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                    onClick={() => updateFeedbackStatus("processed")}
                    disabled={updating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} />
                        Proses
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                    onClick={() => updateFeedbackStatus("completed")}
                    disabled={updating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Terima
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Laporan Masalah</h1>
                <p className="text-gray-600 mt-2">
                  Total: {reports.length} laporan • Ditampilkan: {filteredReports.length} laporan
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
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={18} />
                  Refresh
                </motion.button>
              </div>
            </motion.div>

            {/* Summary Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Laporan</p>
                    <p className="text-3xl font-bold mt-1">{reports.length}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <FileText size={28} className="text-white opacity-80" />
                  </motion.div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Menunggu</p>
                    <p className="text-3xl font-bold mt-1">{waitingReports.length}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Clock size={28} className="text-white opacity-80" />
                  </motion.div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">Diproses</p>
                    <p className="text-3xl font-bold mt-1">{processedReports.length}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <AlertCircle size={28} className="text-white opacity-80" />
                  </motion.div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Selesai</p>
                    <p className="text-3xl font-bold mt-1">{completedReports.length}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <CheckCircle size={28} className="text-white opacity-80" />
                  </motion.div>
                </div>
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
                  className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter size={18} />
                  {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
                </motion.button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Pencarian Nama/Email */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Cari Nama atau Email
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            placeholder="Cari user..."
                            value={searchUser}
                            onChange={(e) => setSearchUser(e.target.value)}
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
                          <option value="waiting">Menunggu</option>
                          <option value="processed">Diproses</option>
                          <option value="completed">Diterima</option>
                          <option value="rejected">Ditolak</option>
                        </select>
                      </div>

                      {/* Filter Kategori */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Filter Kategori
                        </label>
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="all">Semua Kategori</option>
                          {categoryOptions.map((category, i) => (
                            <option key={i} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Info Filter Aktif */}
                    {hasActiveFilters && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <p className="text-sm text-blue-800">
                          Filter aktif: 
                          {searchUser && ` Pencarian: "${searchUser}"`}
                          {statusFilter !== "all" && ` Status: ${getStatusText(statusFilter)}`}
                          {categoryFilter !== "all" && ` Kategori: ${categoryFilter}`}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Daftar Laporan */}
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-12 w-12 border-b-2 border-blue-600"
                />
                <p className="mt-4 text-gray-600">Memuat data laporan...</p>
              </motion.div>
            ) : filteredReports.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl"
              >
                <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 font-medium text-lg mb-2">
                  {hasActiveFilters 
                    ? "Tidak ada laporan yang sesuai dengan filter"
                    : "Belum ada laporan masalah"
                  }
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  {hasActiveFilters 
                    ? "Coba ubah kriteria filter atau hapus filter untuk melihat semua laporan"
                    : "Laporan masalah dari pengguna akan muncul di sini"
                  }
                </p>
                {hasActiveFilters && (
                  <motion.button
                    onClick={clearFilters}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Hapus Semua Filter
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report, index) => (
                  <motion.div
                    key={report.feedback_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {report.user?.name || "Unknown"}
                          </h3>
                          {getStatusBadge(report.status)}
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                            {report.feedback_category}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium text-gray-700">Email</p>
                            <p>{report.user?.email || "No email"}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Waktu Dibuat</p>
                            <p>{getTimeAgo(report.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => openDetail(report)}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium min-w-[120px] justify-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye size={16} />
                          Tinjau
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Footer */}
            {filteredReports.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500 pt-4 border-t border-gray-200"
              >
                <div>
                  Menampilkan <span className="font-medium">{filteredReports.length}</span> dari{" "}
                  <span className="font-medium">{reports.length}</span> laporan
                </div>
                {hasActiveFilters && (
                  <motion.button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Tampilkan Semua Laporan
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}