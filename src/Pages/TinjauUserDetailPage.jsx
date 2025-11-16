import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { userAPI } from "../services/api";

export default function TinjauUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await userAPI.getUserById(id);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user detail:", error);
      setError("Gagal memuat detail pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (status) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setError("");

      await userAPI.verifyOrganizer(id, {
        status: status,
        comment:
          comment || `User ${status === "approved" ? "disetujui" : "ditolak"}`,
      });

      alert(`Pengguna ${status === "approved" ? "disetujui" : "ditolak"}!`);
      navigate("/verifikasiUser");
    } catch (error) {
      console.error("Error verifying user:", error);
      setError("Gagal memverifikasi pengguna");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#E5E7EB]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex justify-center p-4">
        <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-10 mt-32">
          <h2 className="text-2xl font-bold mb-6">Tinjau Pengguna Organizer</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {user ? (
            <div className="space-y-6">
              {/* Foto & Nama */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-300">
                  {user.profile_pict ? (
                    <img
                      src={user.profile_pict}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-500 text-2xl font-bold">
                        {user.name?.charAt(0).toUpperCase() ||
                          user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold">
                    {user.name || user.username}
                  </h3>
                  <p className="text-gray-600">{user.email}</p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                      user.register_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : user.register_status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    Status: {user.register_status}
                  </span>
                </div>
              </div>

              {/* Informasi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <p className="p-3 bg-gray-50 rounded border">
                    {user.username}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <p className="p-3 bg-gray-50 rounded border capitalize">
                    {user.role}
                  </p>
                </div>

                {/* Organizer Info */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Organisasi
                  </label>
                  <p className="p-3 bg-gray-50 rounded border">
                    {user.organization || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Tipe Organisasi
                  </label>
                  <p className="p-3 bg-gray-50 rounded border">
                    {user.organization_type || "-"}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Deskripsi Organisasi
                  </label>
                  <p className="p-3 bg-gray-50 rounded border min-h-20">
                    {user.organization_description || "Tidak ada deskripsi"}
                  </p>
                </div>
              </div>

              {/* KTP */}
              <div>
                <h4 className="font-semibold mb-2">KTP</h4>
                {user.ktp ? (
                  <div className="flex items-center space-x-4">
                    <a
                      href={user.ktp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Lihat KTP
                    </a>
                    <span className="text-sm text-gray-500">
                      (Buka di tab baru)
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-500">Belum upload KTP</p>
                )}
              </div>

              {/* Kolom Komentar */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Komentar Verifikasi:
                </label>
                <textarea
                  className="w-full p-3 rounded border border-gray-300 mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Berikan komentar untuk approval/rejection..."
                ></textarea>
              </div>

              {/* Tombol */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => navigate("/verifikasiUser")}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={submitting}
                >
                  Kembali
                </button>
                <button
                  onClick={() => handleVerify("rejected")}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? "Memproses..." : "Tolak"}
                </button>
                <button
                  onClick={() => handleVerify("approved")}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? "Memproses..." : "Setujui"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600 text-lg">Pengguna tidak ditemukan.</p>
              <button
                onClick={() => navigate("/verifikasiUser")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Kembali ke Daftar Verifikasi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
