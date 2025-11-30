// VerifikasiUserPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { userAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";
import { Search, Filter, X, Eye, RefreshCw, Users, UserCheck, UserSearch, UserX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VerifikasiUserPage() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' atau 'all'

  // State untuk filter dan pencarian
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, allUsers, activeTab, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllOrganizers(); 
      
      const pendingUsers = response.data.filter(
        (u) => u.register_status === "pending"
      );
      setUsers(pendingUsers);
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error fetching organizers:", error);
      showNotification("Gagal memuat daftar organizer", "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const userList = activeTab === "pending" ? users : allUsers;
    let filtered = [...userList];

    // Filter berdasarkan pencarian nama/email
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter berdasarkan status (hanya di tab all)
    if (activeTab === "all" && statusFilter !== "all") {
      filtered = filtered.filter(user => user.register_status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const handleRefresh = () => {
    fetchUsers();
    showNotification("Data diperbarui", "Sukses", "success");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        class: "bg-amber-50 text-amber-700 border border-amber-200", 
        text: "Menunggu",
        icon: UserSearch
      },
      rejected: { 
        class: "bg-red-100 text-red-800 border border-red-200", 
        text: "Ditolak",
        icon: UserX
      },
      approved: { 
        class: "bg-green-100 text-green-800 border border-green-200", 
        text: "Disetujui",
        icon: UserCheck
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.class}`}>
        <IconComponent size={14} />
        {config.text}
      </span>
    );
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Menunggu",
      rejected: "Ditolak",
      approved: "Disetujui",
    };
    return statusMap[status] || status;
  };

  const hasActiveFilters = searchTerm || (activeTab === "all" && statusFilter !== "all");

  const pendingUsers = users.filter(user => user.register_status === "pending");
  const approvedUsers = allUsers.filter(user => user.register_status === "approved");
  const rejectedUsers = allUsers.filter(user => user.register_status === "rejected");

  return (
    <div>
      <Navbar />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mt-32"
          >
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
                <p className="text-gray-600 mt-2">
                  {activeTab === "pending" 
                    ? `Total: ${pendingUsers.length} menunggu verifikasi • Ditampilkan: ${filteredUsers.length} user`
                    : `Total: ${allUsers.length} user • Ditampilkan: ${filteredUsers.length} user`
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-3 mt-4 md:mt-0">
                {hasActiveFilters && (
                  <motion.button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={16} />
                    Hapus Filter
                  </motion.button>
                )}
                
                <motion.button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={18} />
                  Refresh
                </motion.button>
              </div>
            </motion.div>

            {/* Summary Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-2sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold mt-1">{allUsers.length}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Users size={32} className="text-white opacity-80" />
                  </motion.div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-2sm font-medium">Menunggu Verifikasi</p>
                    <p className="text-3xl font-bold mt-1">{pendingUsers.length}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <UserSearch size={32} className="text-white opacity-80" />
                  </motion.div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-2sm font-medium">Terverifikasi</p>
                    <p className="text-3xl font-bold mt-1">{approvedUsers.length}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <UserCheck size={32} className="text-white opacity-80" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex border-b border-gray-200 mb-6"
            >
              <motion.button
                onClick={() => setActiveTab("pending")}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "pending"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Users size={18} />
                Verifikasi User
                {pendingUsers.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                    {pendingUsers.length}
                  </span>
                )}
              </motion.button>
              <motion.button
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "all"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <UserCheck size={18} />
                Lihat All User
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                  {allUsers.length}
                </span>
              </motion.button>
            </motion.div>

            {/* Panel Filter dan Pencarian */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gray-50 rounded-xl p-6 mb-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Filter & Pencarian</h3>
                
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter size={18} />
                  {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
                </motion.button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pencarian Nama/Email */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Cari Nama atau Email
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            placeholder="Cari user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Filter Status (hanya di tab all) */}
                      {activeTab === "all" && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Filter Status
                          </label>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="all">Semua Status</option>
                            <option value="pending">Menunggu</option>
                            <option value="approved">Disetujui</option>
                            <option value="rejected">Ditolak</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Info Filter Aktif */}
                    {hasActiveFilters && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <p className="text-sm text-blue-800">
                          Filter aktif: 
                          {searchTerm && ` Pencarian: "${searchTerm}"`}
                          {activeTab === "all" && statusFilter !== "all" && ` Status: ${getStatusText(statusFilter)}`}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Daftar User */}
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-12 w-12 border-b-2 border-blue-600"
                />
                <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
              </motion.div>
            ) : filteredUsers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl"
              >
                <Users className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 font-medium text-lg mb-2">
                  {hasActiveFilters 
                    ? "Tidak ada user yang sesuai dengan filter"
                    : activeTab === "pending"
                    ? "Tidak ada pengguna organizer yang menunggu verifikasi."
                    : "Tidak ada data pengguna organizer."
                  }
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  {hasActiveFilters 
                    ? "Coba ubah kriteria filter atau hapus filter untuk melihat semua user"
                    : activeTab === "pending"
                    ? "Semua pengguna organizer telah diverifikasi"
                    : "Belum ada pengguna organizer yang terdaftar"
                  }
                </p>
                {hasActiveFilters && (
                  <motion.button
                    onClick={clearFilters}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Hapus Semua Filter
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {user.name || user.username}
                          </h3>
                          {getStatusBadge(user.register_status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium text-gray-700">Email</p>
                            <p>{user.email}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Organisasi</p>
                            <p>{user.organization || "-"}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Terdaftar</p>
                            <p>{new Date(user.created_at).toLocaleDateString('id-ID')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => navigate(`/tinjauUser/${user.user_id}`)}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium min-w-[120px] justify-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye size={16} />
                          Tinjau
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Footer dengan informasi pagination */}
            {filteredUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500 pt-4 border-t border-gray-200"
              >
                <div>
                  Menampilkan <span className="font-medium">{filteredUsers.length}</span> dari{" "}
                  <span className="font-medium">
                    {activeTab === "pending" ? users.length : allUsers.length}
                  </span> user
                </div>
                {hasActiveFilters && (
                  <motion.button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Tampilkan Semua User
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}