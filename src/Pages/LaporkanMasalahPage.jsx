import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import { feedbackAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";
import { Eye } from "lucide-react";

export default function LaporkanMasalahPage() {
  const [activeTab, setActiveTab] = useState("buat"); // buat / riwayat
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
      // Urutkan data dari yang terbaru berdasarkan created_at
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
    custom_category: "" // Field baru untuk kategori custom
  });
  const [proofFile, setProofFile] = useState(null);

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
      alert("Format file harus JPG, JPEG, atau PNG");
      return (e.target.value = "");
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return (e.target.value = "");
    }

    setProofFile(file);
  };

  // Handler untuk custom category dengan batasan 38 karakter
  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    if (value.length <= 38) {
      setForm({ ...form, custom_category: value });
    }
  };

  const submitReport = async () => {
    // Jika memilih "other", gunakan custom_category,否则 gunakan feedback_category
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

  // Kategori feedback - sesuaikan dengan kebutuhan
  const feedbackCategories = [
    { value: "technical", label: "Masalah Teknis" },
    { value: "payment", label: "Masalah Pembayaran" },
    { value: "event", label: "Masalah Event" },
    { value: "account", label: "Masalah Akun" },
    { value: "suggestion", label: "Saran" },
    { value: "other", label: "Lainnya" }
  ];

  // Mapping status untuk tampilan - SESUAIKAN DENGAN ADMIN
  const statusMapping = {
    "waiting": { label: "Menunggu", class: "bg-yellow-100 text-yellow-700" },
    "processed": { label: "Diproses", class: "bg-blue-100 text-blue-700" },
    "completed": { label: "Selesai", class: "bg-green-100 text-green-700" },
    "rejected": { label: "Ditolak", class: "bg-red-100 text-red-700" }
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

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-6xl mx-auto pt-40 bg-white shadow-xl p-8 rounded-2xl">
          <h1 className="text-2xl font-bold mb-8">Laporkan Masalah</h1>

          {/* TOGGLE */}
          <div className="flex w-fit rounded-xl overflow-hidden border mb-10">
            <button
              onClick={() => setActiveTab("buat")}
              className={`px-6 py-2 font-semibold ${
                activeTab === "buat"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Buat Laporan
            </button>
            <button
              onClick={() => setActiveTab("riwayat")}
              className={`px-6 py-2 font-semibold ${
                activeTab === "riwayat"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Riwayat Laporan
            </button>
          </div>

          {/* ---------------- PAGE 1 — FORM BUAT LAPORAN ---------------- */}
          {activeTab === "buat" && (
            <div className="space-y-5">
              {/* Field Pengirim (Otomatis, Non-editable) - DIPENDEKAN */}
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pengirim
                </label>
                <input
                  type="text"
                  placeholder={user?.name || "Memuat nama..."}
                  className="border px-4 py-2 rounded w-full bg-gray-100 text-gray-600"
                  value={user?.name || ""}
                  disabled
                />
              </div>

              {/* Kategori Feedback - DIBAGI 2 KOLOM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori Masalah *
                  </label>
                  <select
                    value={form.feedback_category}
                    onChange={(e) => setForm({ ...form, feedback_category: e.target.value })}
                    className="border px-4 py-2 rounded w-full"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {feedbackCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field untuk kategori custom - muncul hanya jika "Lainnya" dipilih */}
                {form.feedback_category === "other" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tulis Kategori Anda *
                      <span className="text-xs text-gray-500 ml-1">
                        ({form.custom_category.length}/38 karakter)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan kategori masalah..."
                      className="border px-4 py-2 rounded w-full"
                      value={form.custom_category}
                      onChange={handleCustomCategoryChange}
                      maxLength={38} // Batasan HTML native
                      required
                    />
                    {/* Pesan error jika mencapai batas */}
                    {form.custom_category.length >= 38 && (
                      <p className="text-xs text-red-500 mt-1">
                        Maksimal 38 karakter telah tercapai
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Komentar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Masalah *
                </label>
                <textarea
                  placeholder="Jelaskan masalah yang Anda alami..."
                  className="border px-4 py-2 rounded w-full"
                  rows={5}
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  required
                />
              </div>

              {/* Upload bukti */}
              <div className="space-y-1">
                <label className="text-base text-gray-700 font-medium">
                  Lampirkan Gambar (Opsional)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={fileHandler}
                  className="border px-4 py-2 rounded w-full bg-white"
                />
                <p className="text-xs text-gray-500 italic">
                  Maksimal 1 file • Format: JPG/JPEG/PNG • Ukuran Maksimal 5MB
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  className="px-5 py-2 bg-blue-600 text-white rounded disabled:opacity-50 flex items-center gap-2"
                  onClick={submitReport}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Mengirim...
                    </>
                  ) : (
                    "Kirim Laporan"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ---------------- PAGE 2 — TABEL RIWAYAT ---------------- */}
          {activeTab === "riwayat" && (
            <div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Memuat riwayat laporan...</p>
                </div>
              ) : reports.length === 0 ? (
                <p className="text-center text-gray-500 italic mt-10">
                  Anda belum pernah Melaporkan Masalah
                </p>
              ) : (
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-100 border text-left">
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Deskripsi</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Waktu Dibuat</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.feedback_id} className="border-b">
                        <td className="p-3">
                          {/* Tampilkan feedback_category sesuai input, tidak diterjemahkan */}
                          {report.feedback_category}
                        </td>
                        <td className="p-3 max-w-xs">
                          <div className="truncate" title={report.comment}>
                            {report.comment}
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              statusMapping[report.status]?.class || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {statusMapping[report.status]?.label || report.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="text-base text-gray-900">
                            {getTimeAgo(report.created_at)}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center items-center h-full">
                            <button
                              onClick={() => setDetailModal({ open: true, data: report })}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                            >
                              <Eye size={16} />
                              Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Modal Detail */}
          {detailModal.open && detailModal.data && (
            <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-lg space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold">
                  Detail Laporan — {detailModal.data.feedback_category}
                </h2>

                <div>
                  <p className="text-gray-600 text-sm">Kategori:</p>
                  <p className="font-medium">
                    {detailModal.data.feedback_category}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Status:</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      statusMapping[detailModal.data.status]?.class || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {statusMapping[detailModal.data.status]?.label || detailModal.data.status}
                  </span>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Deskripsi Masalah:</p>
                  <p className="border p-3 rounded bg-gray-50 whitespace-pre-wrap">
                    {detailModal.data.comment}
                  </p>
                </div>

                {/* Bukti */}
                {detailModal.data.image && (
                  <div>
                    <p className="text-gray-600 text-sm">Bukti:</p>
                    <a
                      href={detailModal.data.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Lihat Gambar
                    </a>
                  </div>
                )}

                {/* Tanggapan Admin - Hanya tampilkan jika ada reply atau status waiting */}
                {(detailModal.data.reply || detailModal.data.status === "waiting") && (
                  <div>
                    <p className="text-gray-600 text-sm">Tanggapan Admin:</p>
                    {detailModal.data.reply ? (
                      <p className="border p-3 rounded bg-green-50 text-green-700 whitespace-pre-wrap">
                        {detailModal.data.reply}
                      </p>
                    ) : (
                      detailModal.data.status === "waiting" && (
                        <p className="border p-3 rounded bg-yellow-50 text-yellow-700 italic">
                          Admin belum memberikan tanggapan
                        </p>
                      )
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setDetailModal({ open: false, data: null })}
                    className="px-5 py-2 bg-blue-600 text-white rounded"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}