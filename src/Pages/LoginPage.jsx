import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { User, Mail, Lock, Shield, ArrowRight, Eye, EyeOff } from "lucide-react";
import Navbar from "../components/Navbar";
import { authAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username_or_email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { notification, showNotification, hideNotification } = useNotification();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);

      if (response.data.token) {
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem("user", JSON.stringify(response.data.user));

        showNotification("Login berhasil!", "Sukses", "success");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      showNotification(
        err.response?.data?.error || "Login gagal",
        "Error",
        "error"
      );
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
      
      <div className="min-h-screen py-8 flex items-center justify-center py-8">
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={hideNotification}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 pt-32 w-full">
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
                  <h1 className="text-2xl md:text-3xl font-bold">Masuk ke Akun</h1>
                  <p className="text-blue-100 mt-1">Selamat datang kembali</p>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <Shield size={20} />
                  <span className="font-medium">Login</span>
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
                {/* Email/Username */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-blue-600" />
                    Email/Username
                  </label>
                  <input
                    type="text"
                    name="username_or_email"
                    value={formData.username_or_email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="Masukkan Email atau Username"
                    required
                  />
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Lock size={16} className="text-blue-600" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all pr-10"
                      placeholder="Masukkan Password"
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
                        Memproses...
                      </>
                    ) : (
                      <>
                        Masuk
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              <motion.div
                variants={itemVariants}
                className="mt-6 pt-6 border-t border-gray-200 space-y-3"
              >
                <p className="text-sm text-center text-gray-600">
                  Belum punya Akun?{" "}
                  <Link
                    to="/daftar"
                    className="text-blue-600 font-semibold hover:underline hover:text-blue-700 transition-colors"
                  >
                    Daftar
                  </Link>
                </p>
                <p className="text-sm text-center text-gray-600">
                  Ingin mengadakan Event?{" "}
                  <Link
                    to="/daftarEO"
                    className="text-blue-600 font-semibold hover:underline hover:text-blue-700 transition-colors"
                  >
                    Daftar Sebagai Penyelenggara Event
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}