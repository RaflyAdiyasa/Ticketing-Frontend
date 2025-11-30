import { useState, useMemo, useEffect } from "react";
import Navbar from "../components/Navbar";
import { feedbackAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";
import { Eye } from "lucide-react";

export default function LaporanMasalahPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const { notification, showNotification, hideNotification } = useNotification();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchUser, setSearchUser] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");

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
      // Urutkan data dari yang terbaru berdasarkan created_at
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
    "waiting": { label: "Menunggu", class: "bg-yellow-100 text-yellow-700" },
    "processed": { label: "Diproses", class: "bg-blue-100 text-blue-700" },
    "completed": { label: "Diterima", class: "bg-green-100 text-green-700" },
    "rejected": { label: "Ditolak", class: "bg-red-100 text-red-700" }
  };

  // Ambil daftar kategori unik untuk dropdown (tampilkan sesuai input, tidak diterjemahkan)
  const categoryOptions = useMemo(() => {
    const categories = [...new Set(reports.map((r) => r.feedback_category))];
    return ["Semua Kategori", ...categories];
  }, [reports]);

  // ===== FILTERING LOGIC =====
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchUser =
        searchUser === "" ||
        r.user?.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
        r.user?.email?.toLowerCase().includes(searchUser.toLowerCase());

      const matchStatus =
        statusFilter === "Semua Status" || 
        (statusFilter === "Menunggu" && r.status === "waiting") ||
        (statusFilter === "Diproses" && r.status === "processed") ||
        (statusFilter === "Diterima" && r.status === "completed") ||
        (statusFilter === "Ditolak" && r.status === "rejected");

      const matchCategory =
        categoryFilter === "Semua Kategori" || 
        r.feedback_category === categoryFilter;

      return matchUser && matchStatus && matchCategory;
    });
  }, [reports, searchUser, statusFilter, categoryFilter]);

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

      <div className="min-h-screen py-8 flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-6xl mx-auto pt-40 bg-white shadow-xl p-8 rounded-2xl">
          <h1 className="text-2xl font-bold mb-6">Laporan Masalah</h1>

          {/* ================= FILTER & PENCARIAN ================= */}
          <div className="border rounded-xl p-5 mb-8 relative">
            <h2 className="font-semibold text-lg mb-3">Filter & Pencarian</h2>
            <button
              className="absolute top-4 right-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
              onClick={() => setFiltersOpen((prev) => !prev)}
            >
              {filtersOpen ? "Sembunyikan Filter" : "Tampilkan Filter"}
            </button>

            {filtersOpen && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                  {/* SEARCH USER */}
                  <div>
                    <label className="text-sm text-gray-700">Cari Nama atau Email</label>
                    <input
                      type="text"
                      placeholder="Cari user..."
                      className="w-full border rounded-lg px-4 py-2 mt-1"
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                    />
                  </div>

                  {/* FILTER STATUS */}
                  <div>
                    <label className="text-sm text-gray-700">Filter Status</label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 mt-1"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option>Semua Status</option>
                      <option>Menunggu</option>
                      <option>Diproses</option>
                      <option>Diterima</option>
                      <option>Ditolak</option>
                    </select>
                  </div>

                  {/* FILTER CATEGORY */}
                  <div>
                    <label className="text-sm text-gray-700">Filter Kategori</label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 mt-1"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      {categoryOptions.map((category, i) => (
                        <option key={i}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================= TABLE LAPORAN ======================= */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Memuat laporan...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <p className="text-center text-gray-500 italic mt-10">
              {reports.length === 0 ? "Belum ada laporan masalah." : "Tidak ada laporan yang sesuai filter."}
            </p>
          ) : (
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100 border text-left">
                  <th className="p-3">Pengirim</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Waktu Dibuat</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.feedback_id} className="border-b">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{report.user?.name || "Unknown"}</p>
                        <p className="text-sm text-gray-500">{report.user?.email || "No email"}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      {/* Tampilkan feedback_category sesuai input, tidak diterjemahkan */}
                      {report.feedback_category}
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
                          onClick={() => openDetail(report)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Eye size={16} />
                          Tinjau
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ======================= MODAL DETAIL ======================= */}
          {detailModal.open && detailModal.data && (
            <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-lg space-y-5 shadow-xl">
                <h2 className="text-xl font-semibold">
                  Detail Laporan — {detailModal.data.feedback_category}
                </h2>

                <div>
                  <p className="text-gray-600 text-sm">Pengirim:</p>
                  <p className="font-medium">{detailModal.data.user?.name || "Unknown"}</p>
                  <p className="text-sm text-gray-500">{detailModal.data.user?.email || "No email"}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Status Saat Ini:</p>
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

                {/* Bukti Gambar */}
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

                <div>
                  <p className="text-gray-600 text-sm mb-1">Tanggapan Admin:</p>
                  <textarea
                    className="border p-3 rounded w-full bg-white"
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

                <div className="flex justify-between pt-2">
                  <button
                    className="px-5 py-2 bg-gray-300 rounded disabled:opacity-50"
                    onClick={() =>
                      setDetailModal({ open: false, data: null, responseInput: "" })
                    }
                    disabled={updating}
                  >
                    Batal
                  </button>
                  <div className="flex space-x-2">
                    <button
                      className="px-5 py-2 bg-red-600 text-white rounded disabled:opacity-50 flex items-center gap-2"
                      onClick={() => updateFeedbackStatus("rejected")}
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Memproses...
                        </>
                      ) : (
                        "Tolak"
                      )}
                    </button>
                    <button
                      className="px-5 py-2 bg-yellow-600 text-white rounded disabled:opacity-50 flex items-center gap-2"
                      onClick={() => updateFeedbackStatus("processed")}
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Memproses...
                        </>
                      ) : (
                        "Diproses"
                      )}
                    </button>
                    <button
                      className="px-5 py-2 bg-green-600 text-white rounded disabled:opacity-50 flex items-center gap-2"
                      onClick={() => updateFeedbackStatus("completed")}
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Memproses...
                        </>
                      ) : (
                        "Terima"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}