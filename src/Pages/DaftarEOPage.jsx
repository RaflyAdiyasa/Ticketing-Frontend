import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Shield, Building, FileText, Upload, ArrowRight, Eye, EyeOff } from "lucide-react";
import Navbar from "../components/Navbar";
import { authAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";

export default function DaftarEOPage() {
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
  const [showCustomOrgType, setShowCustomOrgType] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrgTypeChange = (e) => {
    const value = e.target.value;
    
    if (value === "Lainnya") {
      setShowCustomOrgType(true);
      setFormData((prev) => ({
        ...prev,
        organization_type: "",
      }));
    } else {
      setShowCustomOrgType(false);
      setFormData((prev) => ({
        ...prev,
        organization_type: value,
      }));
    }
  };

  const handleCustomOrgTypeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      organization_type: e.target.value,
    }));
  };

  const handleKtpChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setErrorMsg("Hanya file JPG, JPEG, atau PNG yang diizinkan!");
        setKtpFile(null);
        setKtpPreview(null);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Ukuran file maksimal 5MB!");
        setKtpFile(null);
        setKtpPreview(null);
        return;
      }

      setErrorMsg("");
      setKtpFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setKtpPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      submitData.append("organization_description", formData.organization_description);
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
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-8">
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={hideNotification}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-200"
          >
            {/* Header dengan Solid Blue */}
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Daftar Sebagai Penyelenggara Event</h1>
                  <p className="text-blue-100 mt-1">Mulai adakan event Anda bersama kami</p>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <Building size={20} />
                  <span className="font-medium">Event Organizer</span>
                </div>
              </div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="p-6 md:p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informasi Organisasi */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building size={20} className="text-blue-600" />
                    Informasi Organisasi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Instansi
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                        placeholder="Masukkan Nama Instansi"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Instansi
                      </label>
                      <select
                        name="organization_type"
                        value={showCustomOrgType ? "Lainnya" : formData.organization_type}
                        onChange={handleOrgTypeChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
                        required
                      >
                        <option value="">-- Pilih Jenis Instansi --</option>
                        <option value="Perguruan Tinggi">Perguruan Tinggi</option>
                        <option value="Sekolah">Sekolah</option>
                        <option value="Perusahaan Teknologi">Perusahaan Teknologi</option>
                        <option value="Perusahaan Manufaktur">Perusahaan Manufaktur</option>
                        <option value="Perusahaan Jasa">Perusahaan Jasa</option>
                        <option value="Perusahaan Retail">Perusahaan Retail</option>
                        <option value="Perusahaan Finansial">Perusahaan Finansial</option>
                        <option value="Perusahaan Startup">Perusahaan Startup</option>
                        <option value="Organisasi Nirlaba">Organisasi Nirlaba</option>
                        <option value="Organisasi Sosial">Organisasi Sosial</option>
                        <option value="Komunitas">Komunitas</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                      
                      {showCustomOrgType && (
                        <div className="mt-2">
                          <input
                            type="text"
                            name="custom_organization_type"
                            value={formData.organization_type}
                            onChange={handleCustomOrgTypeChange}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            placeholder="Masukkan jenis instansi"
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FileText size={16} className="text-blue-600" />
                        Deskripsi Organisasi
                      </label>
                      <textarea
                        name="organization_description"
                        value={formData.organization_description}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                        placeholder="Jelaskan tentang organisasi Anda..."
                        rows="4"
                        required
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Informasi Pribadi */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} className="text-blue-600" />
                    Informasi Pribadi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Pengurus
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                        placeholder="Masukkan Nama Pengurus"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                        placeholder="Masukkan Username"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                        placeholder="Masukkan Email"
                        required
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Keamanan Akun */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-blue-600" />
                    Keamanan Akun
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all pr-10"
                          placeholder="Minimal 6 karakter"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konfirmasi Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all pr-10"
                          placeholder="Konfirmasi Password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Upload KTP */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Upload size={20} className="text-blue-600" />
                    Verifikasi Identitas
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-dashed border-blue-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Upload KTP (JPG/JPEG/PNG - Maks. 5MB)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleKtpChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                      required
                    />
                    
                    {errorMsg && (
                      <p className="text-red-600 text-sm mt-2">{errorMsg}</p>
                    )}

                    {uploadProgress > 0 && (
                      <div className="mt-3">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Mengunggah: {uploadProgress}%</p>
                      </div>
                    )}

                    {ktpPreview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview KTP:</p>
                        <img
                          src={ktpPreview}
                          alt="Preview KTP"
                          className="w-48 rounded-lg shadow-md border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setIsModalOpen(true)}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-4">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Mendaftarkan...
                      </>
                    ) : (
                      <>
                        Daftar Sebagai EO
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              <motion.div
                variants={itemVariants}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <p className="text-sm text-center text-gray-600">
                  Ingin mendaftar sebagai peserta biasa?{" "}
                  <Link
                    to="/daftar"
                    className="text-blue-600 font-semibold hover:underline hover:text-blue-700 transition-colors"
                  >
                    Daftar Sebagai Peserta
                  </Link>
                </p>
                <p className="text-sm text-center text-gray-600 mt-2">
                  Sudah punya akun?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 font-semibold hover:underline hover:text-blue-700 transition-colors"
                  >
                    Masuk di sini
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Modal Preview Gambar KTP */}
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-4 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Preview KTP</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <img
              src={ktpPreview}
              alt="KTP"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}