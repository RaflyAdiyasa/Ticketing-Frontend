import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { eventAPI } from "../services/api";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";
import { 
  Search, 
  Filter, 
  X, 
  Plus, 
  Trash2, 
  ChevronRight, 
  RefreshCw,
  Folder,
  Tag,
  Shapes,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AturEventPage() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();
  const [activeTab, setActiveTab] = useState("kategori");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk kategori event
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subModalOpen, setSubModalOpen] = useState(false);

  // State untuk modal konfirmasi
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "", // 'delete-category', 'delete-subcategory'
    data: null,
    onConfirm: null
  });

  useEffect(() => {
    fetchEventCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [categories, activeTab, searchTerm]);

  const fetchEventCategories = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getEventCategories();
      const categoriesData = response.data.event_category || [];
      setCategories(categoriesData);
      setAllCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching event categories:", error);
      showNotification("Gagal memuat kategori event", "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (activeTab === "kategori") {
      let filtered = [...categories];
      
      if (searchTerm) {
        filtered = filtered.filter(cat =>
          cat.event_category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.child_event_category?.some(sub =>
            sub.child_event_category_name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
      
      setFilteredCategories(filtered);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      showNotification("Nama kategori tidak boleh kosong", "Peringatan", "warning");
      return;
    }

    try {
      await eventAPI.addEventCategory({ category_event: newCategory });
      showNotification("Kategori berhasil ditambahkan", "Sukses", "success");
      setNewCategory("");
      fetchEventCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      showNotification("Gagal menambahkan kategori", "Error", "error");
    }
  };

  const handleAddSubCategory = async () => {
    if (!newSubCategory.trim()) {
      showNotification("Nama subkategori tidak boleh kosong", "Peringatan", "warning");
      return;
    }

    if (!selectedCategory) {
      showNotification("Pilih kategori terlebih dahulu", "Peringatan", "warning");
      return;
    }

    try {
      await eventAPI.addSubEventCategory({ 
        category_event: selectedCategory.event_category_name,
        child_category_event: newSubCategory
      });
      showNotification("Subkategori berhasil ditambahkan", "Sukses", "success");
      setNewSubCategory("");
      setSubModalOpen(false);
      fetchEventCategories();
    } catch (error) {
      console.error("Error adding subcategory:", error);
      showNotification("Gagal menambahkan subkategori", "Error", "error");
    }
  };

  // Fungsi untuk menampilkan modal konfirmasi
  const showConfirmModal = (title, message, type, data, onConfirm) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type,
      data,
      onConfirm
    });
  };

  // Fungsi untuk menyembunyikan modal konfirmasi
  const hideConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      type: "",
      data: null,
      onConfirm: null
    });
  };

  const handleDeleteCategory = async (category) => {
    showConfirmModal(
      "Hapus Kategori",
      `Yakin ingin menghapus kategori "${category.event_category_name}"? Tindakan ini tidak dapat dibatalkan.`,
      "delete-category",
      category,
      async () => {
        try {
          await eventAPI.deleteCategoryEvent({ category_event: category.event_category_name });
          showNotification("Kategori berhasil dihapus", "Sukses", "success");
          fetchEventCategories();
        } catch (error) {
          console.error("Error deleting category:", error);
          const errorMessage = error.response?.data?.error || "Gagal menghapus kategori";
          showNotification(errorMessage, "Error", "error");
        }
      }
    );
  };

  const handleDeleteSubCategory = async (subCategory) => {
    showConfirmModal(
      "Hapus Subkategori",
      `Yakin ingin menghapus subkategori "${subCategory.child_event_category_name}"? Tindakan ini tidak dapat dibatalkan.`,
      "delete-subcategory",
      subCategory,
      async () => {
        try {
          await eventAPI.deleteSubCategoryEvent({ 
            child_category_event: subCategory.child_event_category_name 
          });
          showNotification("Subkategori berhasil dihapus", "Sukses", "success");
          fetchEventCategories();
        } catch (error) {
          console.error("Error deleting subcategory:", error);
          showNotification("Gagal menghapus subkategori", "Error", "error");
        }
      }
    );
  };

  const openSubModal = (category) => {
    setSelectedCategory(category);
    setNewSubCategory("");
    setSubModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
  };

  const handleRefresh = () => {
    fetchEventCategories();
    showNotification("Data diperbarui", "Sukses", "success");
  };

  const hasActiveFilters = searchTerm;

  // Statistik untuk summary cards
  const totalCategories = allCategories.length;
  const totalSubCategories = allCategories.reduce((total, cat) => 
    total + (cat.child_event_category?.length || 0), 0
  );

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
                <h1 className="text-3xl font-bold text-gray-900">Konfigurasi Event</h1>
                <p className="text-gray-600 mt-2">
                  Total: {totalCategories} kategori • {totalSubCategories} subkategori • Ditampilkan: {filteredCategories.length} kategori
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
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-2sm font-medium">Total Kategori</p>
                    <p className="text-3xl font-bold mt-1">{totalCategories}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Shapes size={32} className="text-white opacity-80" />
                  </motion.div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-2sm font-medium">Total Subkategori</p>
                    <p className="text-3xl font-bold mt-1">{totalSubCategories}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Shapes size={32} className="text-white opacity-80" />
                  </motion.div>
                </div>
              </div>
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
                
                <div className="flex items-center gap-3">
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
                      {/* Pencarian */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Cari Kategori atau Subkategori
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            placeholder="Cari kategori..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Info Filter Aktif */}
                    {hasActiveFilters && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <p className="text-sm text-blue-800">
                          Filter aktif: Pencarian: "{searchTerm}"
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ---------------- PAGE KATEGORI EVENT ---------------- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Form Tambah Kategori */}
              <div className="flex gap-3 mb-8">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Tambah kategori baru..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                </div>
                <motion.button
                  onClick={handleAddCategory}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={18} />
                  Tambah
                </motion.button>
              </div>

              {/* Daftar Kategori - VERSI MINIMALIS */}
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
                  <p className="mt-4 text-gray-600">Memuat kategori event...</p>
                </motion.div>
              ) : filteredCategories.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl"
                >
                  <Folder className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 font-medium text-lg mb-2">
                    {hasActiveFilters 
                      ? "Tidak ada kategori yang sesuai dengan filter"
                      : "Belum ada kategori event"
                    }
                  </p>
                  <p className="text-gray-400 text-sm">
                    {hasActiveFilters 
                      ? "Coba ubah kata kunci pencarian atau hapus filter"
                      : "Tambahkan kategori baru untuk mengatur event Anda"
                    }
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {filteredCategories.map((category, index) => (
                    <motion.div
                      key={category.event_category_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => {
                              const updatedCategories = categories.map(cat =>
                                cat.event_category_id === category.event_category_id
                                  ? { ...cat, open: !cat.open }
                                  : cat
                              );
                              setCategories(updatedCategories);
                            }}
                            className="flex items-center gap-2 text-left min-w-0 flex-1"
                          >
                            <motion.div
                              animate={{ rotate: category.open ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight size={18} className="text-gray-500 flex-shrink-0" />
                            </motion.div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-gray-900 truncate">
                                {category.event_category_name}
                              </h3>
                              {category.child_event_category && category.child_event_category.length > 0 && (
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {category.child_event_category.length} subkategori
                                </p>
                              )}
                            </div>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={() => openSubModal(category)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Tambah Subkategori"
                          >
                            <Plus size={16} />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteCategory(category)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Hapus Kategori"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>

                      {/* Subkategori - Minimalis */}
                      <AnimatePresence>
                        {category.open && category.child_event_category && category.child_event_category.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 ml-6 space-y-2"
                          >
                            {category.child_event_category.map((subCategory) => (
                              <motion.div
                                key={subCategory.child_event_category_id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex justify-between items-center py-2 px-3 bg-gray-50 border border-gray-100 rounded-md"
                              >
                                <span className="text-sm text-gray-700">{subCategory.child_event_category_name}</span>
                                <motion.button
                                  onClick={() => handleDeleteSubCategory(subCategory)}
                                  className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Hapus Subkategori"
                                >
                                  <Trash2 size={14} />
                                </motion.button>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Footer dengan informasi */}
            {filteredCategories.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500 pt-4 border-t border-gray-200"
              >
                <div>
                  Menampilkan <span className="font-medium">{filteredCategories.length}</span> dari{" "}
                  <span className="font-medium">{categories.length}</span> kategori
                </div>
                {hasActiveFilters && (
                  <motion.button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Tampilkan Semua Kategori
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal Tambah Subkategori */}
      <AnimatePresence>
        {subModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tambah Subkategori
                </h3>
                <motion.button
                  onClick={() => setSubModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori Induk
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {selectedCategory?.event_category_name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Subkategori
                  </label>
                  <input
                    type="text"
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    placeholder="Masukkan nama subkategori..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubCategory()}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                <motion.button
                  onClick={() => setSubModalOpen(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Batal
                </motion.button>
                <motion.button
                  onClick={handleAddSubCategory}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Simpan
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="flex-shrink-0 p-3 bg-red-100 rounded-full"
                >
                  <AlertTriangle className="text-red-600" size={24} />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {confirmModal.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {confirmModal.message}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
                <motion.button
                  onClick={hideConfirmModal}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Batal
                </motion.button>
                <motion.button
                  onClick={() => {
                    confirmModal.onConfirm();
                    hideConfirmModal();
                  }}
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 size={18} />
                  Hapus
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}