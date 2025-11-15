import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { userAPI } from "../services/api";
import EditProfileModal from "../components/EditProfileModal";

export default function LihatProfilPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
      // Update session storage dengan data terbaru
      sessionStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback ke session storage jika API gagal
      const userData = sessionStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
    setShowEditModal(false);
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
        return "Menunggu Verifikasi";
      case "approved":
        return "Terverifikasi";
      case "rejected":
        return "Ditolak";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Profil Saya</h2>
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Edit Profil
            </button>
          </div>

          {user ? (
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                  {user.profile_pict ? (
                    <img
                      src={user.profile_pict}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-500 text-2xl font-bold">
                        {user.name
                          ? user.name.charAt(0).toUpperCase()
                          : user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {user.name || user.username}
                  </h3>
                  <p className="text-gray-600">
                    {getRoleDisplayName(user.role)}
                  </p>
                  {user.role === "organizer" && (
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        user.register_status === "approved"
                          ? "bg-green-100 text-green-800"
                          : user.register_status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {getStatusDisplay(user.register_status)}
                    </span>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <p className="text-lg p-2 bg-gray-50 rounded">
                    {user.username}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-lg p-2 bg-gray-50 rounded">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <p className="text-lg p-2 bg-gray-50 rounded">
                    {user.name || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <p className="text-lg p-2 bg-gray-50 rounded capitalize">
                    {getRoleDisplayName(user.role)}
                  </p>
                </div>
              </div>

              {/* Organization Information (for organizers) */}
              {user.role === "organizer" && (
                <>
                  <div className="border-t pt-6 mt-6">
                    <h4 className="text-lg font-semibold mb-4">
                      Informasi Organizer
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Organisasi
                        </label>
                        <p className="text-lg p-2 bg-gray-50 rounded">
                          {user.organization || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipe Organisasi
                        </label>
                        <p className="text-lg p-2 bg-gray-50 rounded">
                          {user.organization_type || "-"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deskripsi Organisasi
                        </label>
                        <p className="text-lg p-2 bg-gray-50 rounded min-h-[80px]">
                          {user.organization_description || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* KTP Information */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold mb-4">
                      Verifikasi KTP
                    </h4>
                    {user.ktp ? (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          KTP telah diunggah
                        </p>
                        <a
                          href={user.ktp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Lihat KTP
                        </a>
                      </div>
                    ) : (
                      <p className="text-gray-500">KTP belum diunggah</p>
                    )}
                  </div>

                  {/* Verification Comment */}
                  {user.register_comment && (
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold mb-2">
                        Komentar Verifikasi
                      </h4>
                      <p className="text-gray-700 p-3 bg-gray-50 rounded">
                        {user.register_comment}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <p className="text-gray-600">Gagal memuat data profil.</p>
          )}

          {/* Edit Profile Modal */}
          {showEditModal && (
            <EditProfileModal
              user={user}
              onClose={() => setShowEditModal(false)}
              onUpdate={handleProfileUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
