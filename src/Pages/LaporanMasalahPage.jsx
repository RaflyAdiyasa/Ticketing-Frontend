import { useState, useMemo, useEffect } from "react";
import Navbar from "../components/Navbar";
import { feedbackAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";

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

  // Fetch all feedback on component mount
  useEffect(() => {
    fetchAllFeedback();
  }, []);

  const fetchAllFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackAPI.getAllFeedback();
      setReports(response.data.feedback || []);
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

      // Gunakan feedback_id dari data yang sedang dibuka
      await feedbackAPI.updateFeedbackStatus(detailModal.data.feedback_id, formData);

      showNotification("Status laporan berhasil diupdate!", "Sukses", "success");
      
      // Refresh data
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
    "completed": { label: "Diterima", class: "bg-green-100 text-green-700" },
    "rejected": { label: "Ditolak", class: "bg-red-100 text-red-700" }
  };

  // Ambil daftar kategori unik untuk dropdown
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

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
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
                    <td className="p-3">{report.feedback_category}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          statusMapping[report.status]?.class || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusMapping[report.status]?.label || report.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => openDetail(report)}
                        className="text-blue-600 hover:underline"
                      >
                        Detail
                      </button>
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