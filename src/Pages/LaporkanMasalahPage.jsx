import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { feedbackAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";
import { 
  Eye, 
  Send, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Upload,
  X,
  History,
  PenLine,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LaporkanMasalahPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("buat");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);

  const { notification, showNotification, hideNotification } = useNotification();

  // Effect untuk mengambil data user dari sessionStorage
  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
  }, []);

  // Effect untuk mengambil riwayat laporan saat tab riwayat aktif
  useEffect(() => {
    if (activeTab === "riwayat" && user) {
      fetchMyFeedback();
    }
  }, [activeTab, user]);

  const fetchMyFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackAPI.getMyFeedback();
      const sortedFeedback = (response.data.feedback || []).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setReports(sortedFeedback);
    } catch (err) {
      showNotification(
        err.response?.data?.error || "Gagal memuat riwayat laporan",
        "Error",
        "error"
      );
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const [detailModal, setDetailModal] = useState({ open: false, data: null });

  // FORM BUAT LAPORAN
  const [form, setForm] = useState({ 
    feedback_category: "", 
    comment: "", 
    custom_category: ""
  });
  const [proofFile, setProofFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

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

  const fileHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      showNotification("Format file harus JPG, JPEG, atau PNG", "Peringatan", "warning");
      return (e.target.value = "");
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification("Ukuran file maksimal 5MB", "Peringatan", "warning");
      return (e.target.value = "");
    }

    setProofFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setProofFile(null);
    setPreviewImage(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  // Handler untuk custom category dengan batasan 38 karakter
  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    if (value.length <= 38) {
      setForm({ ...form, custom_category: value });
    }
  };

  const submitReport = async () => {
    const finalCategory = form.feedback_category === "other" 
      ? form.custom_category 
      : form.feedback_category;

    if (!finalCategory.trim() || !form.comment.trim()) {
      showNotification("Harap isi semua field yang wajib", "Peringatan", "warning");
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append("feedback_category", finalCategory);
      formData.append("comment", form.comment);
      if (proofFile) {
        formData.append("image", proofFile);
      }

      await feedbackAPI.createFeedback(formData);

      showNotification("Laporan berhasil dikirim!", "Sukses", "success");
      
      // Reset form
      setForm({ feedback_category: "", comment: "", custom_category: "" });
      setProofFile(null);
      setPreviewImage(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
      
      // Pindah ke tab riwayat dan refresh data
      setActiveTab("riwayat");
      fetchMyFeedback();
      
    } catch (err) {
      showNotification(
        err.response?.data?.error || "Gagal mengirim laporan",
        "Error",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Kategori feedback
  const feedbackCategories = [
    { value: "technical", label: "Masalah Teknis" },
    { value: "payment", label: "Masalah Pembayaran" },
    { value: "event", label: "Masalah Event" },
    { value: "account", label: "Masalah Akun" },
    { value: "suggestion", label: "Saran" },
    { value: "other", label: "Lainnya" }
  ];

  // Mapping status untuk tampilan
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
      label: "Selesai", 
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

  // Animation variants
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
    visible: { opacity: 1, y: 0 }
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
                  onClick={() => setDetailModal({ open: false, data: null })}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Kategori:</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {detailModal.data.feedback_category}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
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

                {/* Tanggapan Admin */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Tanggapan Admin</p>
                  {detailModal.data.reply ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-700 whitespace-pre-wrap">
                        {detailModal.data.reply}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-amber-700 italic">
                        Admin belum memberikan tanggapan
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50">
                <motion.button
                  onClick={() => setDetailModal({ open: false, data: null })}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
                <h1 className="text-3xl font-bold text-gray-900">Laporkan Masalah</h1>
                <p className="text-gray-600 mt-2">
                  Sampaikan keluhan atau saran Anda kepada tim kami
                </p>
              </div>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex border-b border-gray-200 mb-8"
            >
              <motion.button
                onClick={() => setActiveTab("buat")}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "buat"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PenLine size={18} />
                Buat Laporan
              </motion.button>
              <motion.button
                onClick={() => setActiveTab("riwayat")}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "riwayat"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <History size={18} />
                Riwayat Laporan
                {reports.length > 0 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                    {reports.length}
                  </span>
                )}
              </motion.button>
            </motion.div>

            {/* Buat Laporan Tab */}
            {activeTab === "buat" && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Form Section */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gray-50 rounded-xl p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Informasi Laporan
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Kategori Masalah */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Kategori Masalah *
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={form.feedback_category}
                        onChange={(e) => setForm({ ...form, feedback_category: e.target.value, custom_category: "" })}
                        required
                      >
                        <option value="">Pilih kategori masalah</option>
                        {feedbackCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Category Input */}
                    {form.feedback_category === "other" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <label className="block text-sm font-medium text-gray-700">
                          Kategori Lainnya *
                        </label>
                        <input
                          type="text"
                          placeholder="Masukkan kategori masalah..."
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={form.custom_category}
                          onChange={handleCustomCategoryChange}
                          maxLength={38}
                          required
                        />
                        <div className="flex justify-between">
                          <p className="text-xs text-gray-500">
                            {form.custom_category.length}/38 karakter
                          </p>
                          {form.custom_category.length >= 38 && (
                            <p className="text-xs text-red-500">
                              Maksimal karakter tercapai
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Deskripsi Masalah */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Deskripsi Masalah *
                      </label>
                      <textarea
                        placeholder="Jelaskan masalah yang Anda alami secara detail..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                        rows={5}
                        value={form.comment}
                        onChange={(e) => setForm({ ...form, comment: e.target.value })}
                        required
                      />
                    </div>

                    {/* Upload Bukti */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Lampirkan Gambar (Opsional)
                      </label>
                      
                      {!previewImage ? (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-400 transition-colors">
                          <Upload className="text-gray-400 mb-2" size={32} />
                          <span className="text-gray-600 font-medium">Klik untuk upload gambar</span>
                          <span className="text-gray-400 text-sm mt-1">JPG, JPEG, PNG (Maks. 5MB)</span>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={fileHandler}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="relative inline-block">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="max-w-xs max-h-48 rounded-lg object-cover border border-gray-200"
                          />
                          <motion.button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X size={16} />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  variants={itemVariants}
                  className="flex gap-4 pt-6 border-t border-gray-200"
                >
                  <motion.button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Batal
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={submitReport}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                    whileHover={{
                      scale: loading ? 1 : 1.02,
                      y: loading ? 0 : -1,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Kirim Laporan
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Riwayat Laporan Tab */}
            {activeTab === "riwayat" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
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
                    <p className="mt-4 text-gray-600">Memuat riwayat laporan...</p>
                  </motion.div>
                ) : reports.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl"
                  >
                    <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 font-medium text-lg mb-2">
                      Belum ada riwayat laporan
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      Laporan yang Anda kirimkan akan muncul di sini
                    </p>
                    <motion.button
                      onClick={() => setActiveTab("buat")}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Buat Laporan Pertama
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report, index) => (
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
                              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                {report.feedback_category}
                              </span>
                              {getStatusBadge(report.status)}
                            </div>
                            
                            <p className="text-gray-700 line-clamp-2 mb-3">
                              {report.comment}
                            </p>

                            <div className="text-sm text-gray-500">
                              <span className="font-medium">Dibuat:</span> {getTimeAgo(report.created_at)}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => setDetailModal({ open: true, data: report })}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium min-w-[120px] justify-center"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Eye size={16} />
                              Detail
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Footer */}
                {reports.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500 pt-4 border-t border-gray-200"
                  >
                    <div>
                      Total <span className="font-medium">{reports.length}</span> laporan
                    </div>
                    <motion.button
                      onClick={() => setActiveTab("buat")}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      + Buat Laporan Baru
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}