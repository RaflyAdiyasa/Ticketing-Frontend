
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleKtpChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Hanya file JPG, JPEG, dan PNG yang diizinkan!');
        e.target.value = ''; // Reset input file
        return;
      }
      
      // Validasi ukuran file (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB!');
        e.target.value = '';
        return;
      }
      
      setKtpFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi frontend
    if (formData.password !== confirmPassword) {
      setError("Password dan konfirmasi tidak sama!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter!");
      return;
    }

    if (!ktpFile) {
      setError("Harap upload foto KTP!");
      return;
    }

    if (!formData.organization || !formData.organization_type || !formData.organization_description) {
      setError("Semua field organisasi harus diisi!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();
      submitData.append("username", formData.username);
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("role", formData.role);
      submitData.append("organization", formData.organization);
      submitData.append("organization_type", formData.organization_type);
      submitData.append("organization_description", formData.organization_description);
      submitData.append("ktp", ktpFile);

      console.log("Mengirim data registrasi...");
      
      const response = await authAPI.register(submitData);
      console.log("Response:", response);

      if (response.data.message) {
        alert("Registrasi berhasil! Menunggu persetujuan admin.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Error detail:", err);
      const errorMessage = err.response?.data?.error || 
                          err.message || 
                          "Registrasi gagal. Coba lagi.";
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-4 overflow-auto">
      <div className="w-full max-w-lg bg-white shadow-xl my-50 rounded-2xl p-8 ">
        <h2 className="text-2xl font-bold text-center mb-6">
          Daftar Sebagai <br /> Penyelenggara Event
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mb-4 bg-[#044888] text-white py-2 rounded-xl hover:bg-[#0C8CE9] cursor-pointer transition-all disabled:opacity-50"
          >
            {loading ? "Loading..." : "Daftar"}
          </button>
        </form>
      </div>
    </div>
  );
}
