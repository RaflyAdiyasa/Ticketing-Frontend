import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { userAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";

export default function VerifikasiUserPage() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingOrganizers();
  }, []);

  const fetchPendingOrganizers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllOrganizers(); 
      
      const pending = response.data.filter(
        (u) => u.register_status === "pending"
      );
      setUsers(pending);
    } catch (error) {
      console.error("Error fetching organizers:", error);
      showNotification("Gagal memuat daftar organizer", "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPendingOrganizers();
    showNotification("Data diperbarui", "Sukses", "success");
  };

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

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Verifikasi Pengguna Organizer</h2>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">Tidak ada pengguna organizer yang menunggu verifikasi.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.user_id}
                  className="p-4 bg-gray-50 rounded-lg shadow flex justify-between items-center hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{user.name || user.username}</h3>
                    <p className="text-gray-700 text-sm">{user.email}</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Organisasi: {user.organization || "-"}
                    </p>
                    
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

                  <button
                    onClick={() => navigate(`/tinjauUser/${user.user_id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Tinjau
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}