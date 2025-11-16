import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";

export default function DaftarEOForm() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "organizer",
    organization: "",
    organization_type: "",
    organization_description: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ktpFile, setKtpFile] = useState(null);
  const [ktpPreview, setKtpPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } =
    useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi frontend
    if (formData.password !== confirmPassword) {
      showNotification("Password dan konfirmasi tidak sama!", "Error", "error");
      return;
    }

    if (formData.password.length < 6) {
      showNotification("Password minimal 6 karakter!", "Error", "error");
      return;
    }

    if (!ktpFile) {
      showNotification("Harap upload foto KTP!", "Error", "error");
      return;
    }

    if (
      !formData.organization ||
      !formData.organization_type ||
      !formData.organization_description
    ) {
      showNotification("Semua field organisasi harus diisi!", "Error", "error");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("username", formData.username);
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("role", formData.role);
      submitData.append("organization", formData.organization);
      submitData.append("organization_type", formData.organization_type);
      submitData.append(
        "organization_description",
        formData.organization_description
      );
      submitData.append("ktp", ktpFile);

      const response = await authAPI.register(submitData);

      if (response.data.message) {
        showNotification(
          "Registrasi berhasil! Menunggu persetujuan admin.",
          "Sukses",
          "success"
        );
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Registrasi gagal. Coba lagi.";
      showNotification(errorMessage, "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-4 overflow-auto">
      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div className="w-full max-w-lg bg-white shadow-xl my-50 rounded-2xl p-8 ">
        <h2 className="text-2xl font-bold text-center mb-6">
          Daftar Sebagai <br /> Penyelenggara Event
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Instansi */}
          <div>
            <label className="block text-gray-700 mb-1">Nama Instansi</label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              className="w-full border border-gray-500 rounded-xl px-4 py-2"
              placeholder="Masukkan Nama Instansi"
              required
            />
          </div>

          {/* Jenis Instansi dropdown */}
          <div>
            <label className="block text-gray-700 mb-1">Jenis Instansi</label>
            <select
              name="organization_type"
              value={formData.organization_type}
              onChange={handleChange}
              className="w-full border border-gray-500 rounded-xl px-4 py-2 cursor-pointer"
              required
            >
              <option value="">-- Pilih Jenis Instansi --</option>
              <option value="Perguruan Tinggi">Perguruan Tinggi</option>
              <option value="Sekolah">Sekolah</option>
              <option value="Perusahaan">Perusahaan</option>
              <option value="Organisasi">Organisasi</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {/* Nama Pengurus */}
          <div>
            <label className="block text-gray-700 mb-1">Nama Pengurus</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-500 rounded-xl px-4 py-2"
              placeholder="Masukkan Nama Pengurus"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border border-gray-500 rounded-xl px-4 py-2"
              placeholder="Masukkan Username"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-500 rounded-xl px-4 py-2"
              placeholder="Masukkan Email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-500 rounded-xl px-4 py-2"
              placeholder="Masukkan Password"
              required
            />
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-gray-700 mb-1">
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-500 rounded-xl px-4 py-2"
              placeholder="Konfirmasi Password"
              required
            />
          </div>

          {/* Deskripsi Organisasi */}
          <div>
            <label className="block text-gray-700 mb-1">
              Deskripsi Organisasi
            </label>
            <textarea
              name="organization_description"
              value={formData.organization_description}
              onChange={handleChange}
              className="w-full border border-gray-500 rounded-xl px-4 py-2"
              placeholder="Masukkan deskripsi organisasi"
              rows="3"
              required
            />
          </div>

          {/* Upload KTP */}
          <div>
            <label className="block text-gray-700 mb-1">
              Upload KTP (JPG/JPEG/PNG)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleKtpChange}
              className="w-full border border-gray-500 rounded-xl px-4 py-2 bg-gray-50 hover:bg-[#0C8CE9] cursor-pointer"
              required
            />
            {/* Pesan error */}
            {errorMsg && (
              <p className="text-red-600 text-sm mt-1">{errorMsg}</p>
            )}

            {/* Progress bar */}
            {uploadProgress > 0 && (
              <div className="h-2 mt-2 bg-gray-300 rounded-xl overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            {/* Thumbnail preview */}
            {ktpPreview && (
              <img
                src={ktpPreview}
                alt="Preview KTP"
                className="mt-3 w-40 rounded-lg shadow-md border cursor-pointer hover:opacity-80"
                onClick={() => setIsModalOpen(true)}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mb-4 bg-[#044888] text-white py-2 rounded-xl hover:bg-[#0C8CE9] cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>
        </form>
      </div>

      {/* ✅ Modal Preview Gambar KTP */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <img
            src={ktpPreview}
            alt="KTP"
            className="w-[80%] max-w-lg rounded-xl shadow-2xl border-2 border-white"
          />
        </div>
      )}
    </div>
  );
}
