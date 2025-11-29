import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { userAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";
import { motion } from "framer-motion";
import { 
  User, Mail, Building, MapPin, FileText, 
  Shield, ArrowLeft, CheckCircle, XCircle, Clock
} from "lucide-react";

export default function TinjauUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserById(id);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user detail:", error);
      showNotification("Gagal memuat detail pengguna", "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (status) => {
    if (submitting) return;

    try {
      setSubmitting(true);

      await userAPI.verifyOrganizer(id, {
        status: status,
        comment: comment || `User ${status === "approved" ? "disetujui" : "ditolak"}`,
      });

      showNotification(
        `Pengguna berhasil ${status === "approved" ? "disetujui" : "ditolak"}!`,
        "Sukses",
        "success"
      );
      
      // Navigate after a short delay to show the notification
      setTimeout(() => {
        navigate("/verifikasiUser");
      }, 1500);
    } catch (error) {
      console.error("Error verifying user:", error);
      showNotification("Gagal memverifikasi pengguna", "Error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending":
        return { text: "Menunggu Verifikasi", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock };
      case "approved":
        return { text: "Terverifikasi", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle };
      case "rejected":
        return { text: "Ditolak", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle };
      default:
        return { text: status, color: "bg-gray-100 text-gray-800 border-gray-200", icon: Shield };
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

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Memuat detail pengguna...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const statusInfo = user ? getStatusDisplay(user.register_status) : null;
  const StatusIcon = statusInfo?.icon;

  return (
    <div>
      <Navbar />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header dengan Gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Tinjau Pengguna Organizer</h1>
                  <p className="text-blue-100 mt-1">Verifikasi dan tinjau data pengguna organizer</p>
                </div>
                <motion.button
                  onClick={() => navigate("/verifikasiUser")}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all font-medium backdrop-blur-sm"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={18} />
                  Kembali
                </motion.button>
              </div>
            </div>

            {user ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="p-6 md:p-8"
              >
                {/* Profile Header */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 pb-6 border-b border-gray-200"
                >
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden shadow-lg"
                    >
                      {user.profile_pict ? (
                        <img
                          src={user.profile_pict}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <User className="text-white" size={32} />
                        </div>
                      )}
                    </motion.div>
                    {statusInfo && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute -bottom-2 -right-2"
                      >
                        <div className={`${statusInfo.color} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md border`}>
                          <StatusIcon size={12} />
                          {statusInfo.text}
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {user.name || user.username}
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={16} />
                        <span className="font-medium capitalize">{user.role}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={16} />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Basic Information Grid */}
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                >
                  <div className="bg-gray-50 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="text-blue-600" size={20} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Informasi Pribadi</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Username
                        </label>
                        <p className="text-gray-900 font-medium p-3 bg-white rounded-lg border border-gray-200">
                          {user.username}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Nama Lengkap
                        </label>
                        <p className="text-gray-900 font-medium p-3 bg-white rounded-lg border border-gray-200">
                          {user.name || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900 font-medium p-3 bg-white rounded-lg border border-gray-200">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Shield className="text-green-600" size={20} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Informasi Akun</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Role
                        </label>
                        <p className="text-gray-900 font-medium p-3 bg-white rounded-lg border border-gray-200 capitalize">
                          {user.role}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Status Verifikasi
                        </label>
                        <div className={`p-3 rounded-lg border ${statusInfo.color} font-medium`}>
                          {statusInfo.text}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Organization Information */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building className="text-blue-600" size={20} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Informasi Organizer</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Building size={16} />
                        Nama Organisasi
                      </label>
                      <p className="text-gray-900 font-medium p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
                        {user.organization || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin size={16} />
                        Tipe Organisasi
                      </label>
                      <p className="text-gray-900 font-medium p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
                        {user.organization_type || "-"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FileText size={16} />
                        Deskripsi Organisasi
                      </label>
                      <p className="text-gray-900 p-3 bg-white rounded-lg border border-blue-200 shadow-sm min-h-20">
                        {user.organization_description || "Tidak ada deskripsi"}
                      </p>
                    </div>
                  </div>

                  {/* KTP Information */}
                  <div className="mt-6 pt-6 border-t border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield size={18} />
                      Verifikasi KTP
                    </h4>
                    {user.ktp ? (
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-gray-600 mb-3">KTP telah diunggah untuk verifikasi</p>
                        <a
                          href={user.ktp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <FileText size={16} />
                          Lihat Dokumen KTP
                        </a>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">KTP belum diunggah untuk verifikasi</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Kolom Komentar */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Komentar Verifikasi
                  </h3>
                  <textarea
                    className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Berikan komentar untuk approval/rejection..."
                  ></textarea>
                </motion.div>

                {/* Tombol Aksi */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200"
                >
                  <motion.button
                    onClick={() => navigate("/verifikasiUser")}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeft size={18} />
                    Kembali
                  </motion.button>
                  <motion.button
                    onClick={() => handleVerify("rejected")}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <XCircle size={18} />
                        Tolak
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => handleVerify("approved")}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Setujui
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center"
              >
                <div className="text-gray-400 mb-4">
                  <User size={48} className="mx-auto" />
                </div>
                <p className="text-gray-600 text-lg mb-4">Pengguna tidak ditemukan.</p>
                <motion.button
                  onClick={() => navigate("/verifikasiUser")}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={18} />
                  Kembali ke Daftar Verifikasi
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}