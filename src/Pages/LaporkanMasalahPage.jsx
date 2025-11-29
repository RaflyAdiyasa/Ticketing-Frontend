import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function LaporkanMasalahPage() {
  const [activeTab, setActiveTab] = useState("buat"); // buat / riwayat

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    if (user) {
    setForm((prev) => ({ ...prev, user: user.name }));
  }
  }, [user]);

  const [reports, setReports] = useState([
    {
      id: 1,
      user: "Andi Saputra",
      subject: "Kesalahan jadwal event",
      message:
        "Saya menemukan jadwal event yang tidak sesuai dengan informasi di website resmi.",
      response:
        "Terima kasih atas informasinya, kami sudah melakukan perbaikan.",
      status: "Selesai",
      proofURL: null,
    },
    {
      id: 2,
      user: "Rani Yuliana",
      subject: "Gagal pembayaran tiket",
      message: "Transaksi sudah berhasil tapi tiket tidak masuk email.",
      response: "",
      status: "Sedang diproses",
      proofURL: null,
    },
  ]);

  const [detailModal, setDetailModal] = useState({ open: false, data: null });

  // FORM BUAT LAPORAN
  const [form, setForm] = useState({ user: "", subject: "", message: "" });
  const [proofFile, setProofFile] = useState(null);

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

  const submitReport = () => {
    if (!form.user.trim() || !form.subject.trim() || !form.message.trim())
      return;

    const newReport = {
      id: Date.now(),
      user: form.user,
      subject: form.subject,
      message: form.message,
      response: "",
      status: "Sedang diproses",
      proofURL: proofFile ? URL.createObjectURL(proofFile) : null,
    };

    setReports([...reports, newReport]);

    // Reset form
    setForm({ user: "", subject: "", message: "" });
    setProofFile(null);

    setActiveTab("riwayat");
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-5xl mx-auto pt-40 bg-white shadow-xl p-8 rounded-2xl">
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

    {/* Field Pengirim (Otomatis, Non-editable) */}
    <input
      type="text"
      placeholder={user?.name || "Memuat nama..."}
      className="border px-4 py-2 rounded w-full bg-gray-100 text-gray-600"
      value={form.user}
      disabled
    />

    <input
      type="text"
      placeholder="Subjek"
      className="border px-4 py-2 rounded w-full"
      value={form.subject}
      onChange={(e) => setForm({ ...form, subject: e.target.value })}
    />

    <textarea
      placeholder="Isi Pesan"
      className="border px-4 py-2 rounded w-full"
      rows={5}
      value={form.message}
      onChange={(e) => setForm({ ...form, message: e.target.value })}
    />

    {/* Upload bukti */}
    <div className="space-y-1">
      <label className="text-base text-gray-700 font-medium">
        Lampirkan Gambar
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
        className="px-5 py-2 bg-blue-600 text-white rounded"
        onClick={submitReport}
      >
        Kirim Laporan
      </button>
    </div>
  </div>
)}


          {/* ---------------- PAGE 2 — TABEL RIWAYAT ---------------- */}
          {activeTab === "riwayat" && (
            <div>
              {reports.length === 0 ? (
                <p className="text-center text-gray-500 italic mt-10">
                  Anda belum pernah Melaporkan Masalah
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
                    {reports.map((r) => (
                      <tr key={r.id} className="border-b">
                        <td className="p-3">{r.user}</td>
                        <td className="p-3">{r.subject}</td>
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              r.status === "Selesai"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() =>
                              setDetailModal({ open: true, data: r })
                            }
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
            </div>
          )}

          {/* Modal Detail */}
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

                {/* Bukti */}
                {detailModal.data.proofURL && (
                  <div>
                    <p className="text-gray-600 text-sm">Bukti:</p>
                    <a
                      href={detailModal.data.proofURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Lihat Gambar
                    </a>
                  </div>
                )}

                <div>
                  <p className="text-gray-600 text-sm">Tanggapan Admin:</p>
                  {detailModal.data.response ? (
                    <p className="border p-3 rounded bg-green-50 text-green-700">
                      {detailModal.data.response}
                    </p>
                  ) : (
                    <p className="border p-3 rounded bg-yellow-50 text-yellow-700 italic">
                      Admin belum memberikan tanggapan
                    </p>
                  )}
                </div>

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
