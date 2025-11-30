import { useState, useMemo } from "react";
import Navbar from "../components/Navbar";

export default function LaporanMasalahPage() {
  const [reports, setReports] = useState([
    {
      id: 1,
      user: "Andi Saputra",
      email: "andi@gmail.com",
      subject: "Kesalahan jadwal event",
      message: "Saya menemukan jadwal event yang tidak sesuai dengan website resmi.",
      response: "",
      status: "Sedang diproses",
    },
    {
      id: 2,
      user: "Rani Yuliana",
      email: "rani@mail.com",
      subject: "Gagal pembayaran tiket",
      message: "Transaksi berhasil, tetapi tiket tidak masuk ke email.",
      response: "",
      status: "Sedang diproses",
    },
  ]);

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchUser, setSearchUser] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [subjectFilter, setSubjectFilter] = useState("Semua Subjek");

  const [detailModal, setDetailModal] = useState({
    open: false,
    data: null,
    responseInput: "",
  });

  const openDetail = (report) => {
    setDetailModal({
      open: true,
      data: report,
      responseInput: report.response || "",
    });
  };

  const changeStatus = (status) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === detailModal.data.id
          ? { ...r, status, response: detailModal.responseInput }
          : r
      )
    );
    setDetailModal({ open: false, data: null, responseInput: "" });
  };

  // Ambil daftar subjek unik untuk dropdown
  const subjectOptions = ["Semua Subjek", ...new Set(reports.map((r) => r.subject))];

  // ===== FILTERING LOGIC =====
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchUser =
        searchUser === "" ||
        r.user.toLowerCase().includes(searchUser.toLowerCase()) ||
        r.email.toLowerCase().includes(searchUser.toLowerCase());

      const matchStatus =
        statusFilter === "Semua Status" || r.status === statusFilter;

      const matchSubject =
        subjectFilter === "Semua Subjek" || r.subject === subjectFilter;

      return matchUser && matchStatus && matchSubject;
    });
  }, [reports, searchUser, statusFilter, subjectFilter]);

  return (
    <div>
      <Navbar />

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
                      <option>Sedang diproses</option>
                      <option>Selesai</option>
                      <option>Ditolak</option>
                    </select>
                  </div>

                  {/* FILTER SUBJECT */}
                  <div>
                    <label className="text-sm text-gray-700">Filter Subjek</label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 mt-1"
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                    >
                      {subjectOptions.map((s, i) => (
                        <option key={i}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================= TABLE LAPORAN ======================= */}
          {filteredReports.length === 0 ? (
            <p className="text-center text-gray-500 italic mt-10">
              Tidak ada laporan yang sesuai filter.
            </p>
          ) : (
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100 border text-left">
                  <th className="p-3">Pengirim</th>
                  <th className="p-3">Subjek</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-3">{r.user}</td>
                    <td className="p-3">{r.subject}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          r.status === "Selesai"
                            ? "bg-green-100 text-green-700"
                            : r.status === "Ditolak"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => openDetail(r)}
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
          {detailModal.open && (
            <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-lg space-y-5 shadow-xl">
                <h2 className="text-xl font-semibold">
                  Detail Laporan — {detailModal.data.subject}
                </h2>

                <div>
                  <p className="text-gray-600 text-sm">Pengirim:</p>
                  <p className="font-medium">{detailModal.data.user}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Isi Pesan:</p>
                  <p className="border p-3 rounded bg-gray-50">
                    {detailModal.data.message}
                  </p>
                </div>

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
                    placeholder="Tulis tanggapan admin (opsional)..."
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    className="px-5 py-2 bg-gray-300 rounded"
                    onClick={() =>
                      setDetailModal({ open: false, data: null, responseInput: "" })
                    }
                  >
                    Batal
                  </button>
                  <div className="space-x-2">
                    <button
                      className="px-5 py-2 bg-red-600 text-white rounded"
                      onClick={() => changeStatus("Ditolak")}
                    >
                      Tolak
                    </button>
                    <button
                      className="px-5 py-2 bg-green-600 text-white rounded"
                      onClick={() => changeStatus("Selesai")}
                    >
                      Terima
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
