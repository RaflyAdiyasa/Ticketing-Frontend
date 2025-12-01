import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { userAPI } from "../services/api";
import EditProfileModal from "../components/EditProfileModal";
import ImagePreviewModal from "../components/ImagePreviewModal"; // IMPORT BARU
import { motion } from "framer-motion";
import { 
  User, Mail, Building, MapPin, FileText, 
  Calendar, Shield, Edit, RefreshCw, CheckCircle, 
  Clock, XCircle, Download, Eye
} from "lucide-react"; // TAMBAH IMPORT Download dan Eye

export default function LihatProfilPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false); // STATE BARU
  const [previewImageData, setPreviewImageData] = useState({ // STATE BARU
    src: "",
    alt: "",
    type: "profile" // "profile" atau "ktp"
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
      sessionStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching profile:", error);
      const userData = sessionStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserProfile();
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
    setShowEditModal(false);
  };

  // FUNGSI BARU: Untuk membuka preview foto profil
  const handleViewProfilePicture = () => {
    if (user?.profile_pict) {
      setPreviewImageData({
        src: user.profile_pict,
        alt: `Foto Profil - ${user.name || user.username}`,
        type: "profile"
      });
      setShowImagePreview(true);
    }
  };

  // FUNGSI BARU: Untuk membuka preview KTP
  const handleViewKTP = () => {
    if (user?.ktp) {
      setPreviewImageData({
        src: user.ktp,
        alt: `KTP - ${user.name || user.username}`,
        type: "ktp"
      });
      setShowImagePreview(true);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "user":
        return "User";
      case "organizer":
        return "Event Organizer";
      case "admin":
        return "Administrator";
      default:
        return "User";
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending":
        return { text: "Menunggu Verifikasi", color: "bg-yellow-100 text-yellow-800", icon: Clock };
      case "approved":
        return { text: "Terverifikasi", color: "bg-green-100 text-green-800", icon: CheckCircle };
      case "rejected":
        return { text: "Ditolak", color: "bg-red-100 text-red-800", icon: XCircle };
      default:
        return { text: status, color: "bg-gray-100 text-gray-800", icon: Shield };
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
        <div className="min-h-screen py-8 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Memuat data profil...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const statusInfo = user.role === "organizer" ? getStatusDisplay(user.register_status) : null;
  const StatusIcon = statusInfo?.icon;

  return (
    <div>
      <Navbar />

      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header tanpa gradient biru */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl md:text-3xl font-bold text-gray-900"
                  >
                    Profil Saya
                  </motion.h1>
                  <p className="text-gray-500 mt-1">Kelola informasi profil Anda</p>
                </div>
                <motion.button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-lg transition-all font-medium shadow-md"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit size={18} />
                  Edit Profil
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
                      className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden shadow-lg group cursor-pointer"
                      onClick={handleViewProfilePicture}
                    >
                      {user.profile_pict ? (
                        <>
                          <img
                            src={user.profile_pict}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay untuk preview */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Eye className="text-white" size={24} />
                          </div>
                        </>
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center bg-gray-300 cursor-pointer"
                          onClick={handleViewProfilePicture}
                        >
                          <User className="text-white" size={32} />
                        </div>
                      )}
                    </motion.div>
                    
                    {/* Tombol Lihat Foto (selalu tampil di bawah foto) */}
                    {user.profile_pict && (
                      <motion.button
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={handleViewProfilePicture}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 justify-center w-full"
                      >
                        <Eye size={12} />
                        Lihat Foto
                      </motion.button>
                    )}

                    {user.role === "organizer" && statusInfo && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute -bottom-2 -right-2"
                      >
                        <div className={`${statusInfo.color} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md`}>
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
                        <span className="font-medium">{getRoleDisplayName(user.role)}</span>
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
                        <p className="text-gray-900 font-medium p-2 bg-white rounded-lg border border-gray-200">
                          {user.username}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Nama Lengkap
                        </label>
                        <p className="text-gray-900 font-medium p-2 bg-white rounded-lg border border-gray-200">
                          {user.name || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900 font-medium p-2 bg-white rounded-lg border border-gray-200">
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
                        <p className="text-gray-900 font-medium p-2 bg-white rounded-lg border border-gray-200 capitalize">
                          {getRoleDisplayName(user.role)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Status Akun
                        </label>
                        <p className="text-gray-900 font-medium p-2 bg-white rounded-lg border border-gray-200">
                          Aktif
                        </p>
                      </div>
                      {user.role === "organizer" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Status Verifikasi
                          </label>
                          <div className={`p-2 rounded-lg border ${statusInfo.color} font-medium`}>
                            {statusInfo.text}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Organization Information */}
                {user.role === "organizer" && (
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
                          {user.organization_description || "-"}
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
                          <p className="text-sm text-gray-600 mb-3">KTP telah diunggah dan diverifikasi</p>
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={handleViewKTP}
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye size={16} />
                              Lihat KTP
                            </button>
                            <a
                              href={user.ktp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium px-3 py-1.5 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Download size={16} />
                              Download KTP
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-yellow-800">KTP belum diunggah untuk verifikasi</p>
                        </div>
                      )}
                    </div>

                    {/* Verification Comment */}
                    {user.register_comment && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 pt-6 border-t border-blue-200"
                      >
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText size={18} />
                          Komentar Verifikasi
                        </h4>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-gray-700">{user.register_comment}</p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
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
                <p className="text-gray-600 text-lg">Gagal memuat data profil.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}

      {/* Image Preview Modal */}
      {showImagePreview && (
        <ImagePreviewModal
          isOpen={showImagePreview}
          onClose={() => setShowImagePreview(false)}
          imageSrc={previewImageData.src}
          imageAlt={previewImageData.alt}
          aspectRatio="square" // Foto profil selalu square
          showDownloadButton={true} // Opsional: tampilkan tombol download
          onDownload={() => {
            // Fungsi untuk download gambar
            const link = document.createElement('a');
            link.href = previewImageData.src;
            link.download = previewImageData.type === 'profile' 
              ? `profile-${user.username}.jpg` 
              : `ktp-${user.username}.jpg`;
            link.click();
          }}
        />
      )}
    </div>
  );
}