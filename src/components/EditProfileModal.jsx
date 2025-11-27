import { useState, useRef } from "react";
import { userAPI } from "../services/api";
import useNotification from "../hooks/useNotification";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, User, Mail, Lock, Building, MapPin, FileText, Eye, EyeOff } from "lucide-react";

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    password: '',
    profile_pict: null,
    organization: user.organization || '',
    organization_type: user.organization_type || '',
    organization_description: user.organization_description || '',
  });
  const [previewImages, setPreviewImages] = useState({
    profile_pict: user.profile_pict || '',
  });
  const [loading, setLoading] = useState(false);
  const [showCustomOrgType, setShowCustomOrgType] = useState(
    user.organization_type && 
    !["Perguruan Tinggi", "Sekolah", "Perusahaan Teknologi", "Perusahaan Manufaktur", 
      "Perusahaan Jasa", "Perusahaan Retail", "Perusahaan Finansial", "Perusahaan Startup", 
      "Organisasi Nirlaba", "Organisasi Sosial", "Komunitas"].includes(user.organization_type)
  );
  const [showPassword, setShowPassword] = useState(false);
  
  const profilePictRef = useRef(null);
  const { showNotification } = useNotification();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrgTypeChange = (e) => {
    const value = e.target.value;
    
    if (value === "Lainnya") {
      setShowCustomOrgType(true);
      setFormData(prev => ({
        ...prev,
        organization_type: "",
      }));
    } else {
      setShowCustomOrgType(false);
      setFormData(prev => ({
        ...prev,
        organization_type: value,
      }));
    }
  };

  const handleCustomOrgTypeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      organization_type: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (file) {
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      const previewUrl = URL.createObjectURL(file);
      setPreviewImages(prev => ({
        ...prev,
        [name]: previewUrl
      }));
    }
  };

  const clearFile = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null
    }));
    setPreviewImages(prev => ({
      ...prev,
      [fieldName]: user[fieldName] || ''
    }));

    if (fieldName === 'profile_pict' && profilePictRef.current) {
      profilePictRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      if (user.role === 'user' || user.role === 'organizer') {
        submitData.append('name', formData.name);
        submitData.append('email', formData.email);
        if (formData.password) {
          submitData.append('password', formData.password);
        }
        if (formData.profile_pict) {
          submitData.append('profile_pict', formData.profile_pict);
        }
      }

      if (user.role === 'organizer') {
        if (formData.organization !== user.organization) {
          submitData.append('organization', formData.organization);
        }
        if (formData.organization_type !== user.organization_type) {
          submitData.append('organization_type', formData.organization_type);
        }
        if (formData.organization_description !== user.organization_description) {
          submitData.append('organization_description', formData.organization_description);
        }
      }

      if (user.role === 'admin' && formData.password) {
        submitData.append('password', formData.password);
      }

      const response = await userAPI.updateProfile(submitData);
      onUpdate(response.data.user);
      
      showNotification('Profil berhasil diperbarui!', 'Update Berhasil', 'success');
      
      Object.values(previewImages).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });

      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Gagal memperbarui profil', 'Update Gagal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    Object.values(previewImages).forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    onClose();
  };

  return (
    <AnimatePresence>
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
          className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <motion.h3 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold text-gray-900"
              >
                Edit Profil
              </motion.h3>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture Section */}
              {(user.role === 'user' || user.role === 'organizer') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <div className="flex items-center gap-2">
                      <Camera size={16} />
                      Foto Profil
                    </div>
                  </label>
                  
                  <div className="flex items-center gap-4 mb-3">
                    {/* Preview */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden shadow-md">
                        {(previewImages.profile_pict || user.profile_pict) ? (
                          <img
                            src={previewImages.profile_pict || user.profile_pict}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <User className="text-gray-400" size={20} />
                          </div>
                        )}
                      </div>
                      {(previewImages.profile_pict || user.profile_pict) && (
                        <motion.button
                          type="button"
                          onClick={() => clearFile('profile_pict')}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-md"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ×
                        </motion.button>
                      )}
                    </div>
                    
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 cursor-pointer"
                    >
                      <input
                        ref={profilePictRef}
                        type="file"
                        name="profile_pict"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <Camera size={20} className="mx-auto text-gray-400 mb-1" />
                        <p className="text-sm text-gray-600">Unggah Foto</p>
                        <p className="text-xs text-gray-500">Kosongkan jika tidak ingin mengubah</p>
                      </div>
                    </motion.label>
                  </div>
                </motion.div>
              )}

              {/* Common Fields */}
              {(user.role === 'user' || user.role === 'organizer') && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        Nama Lengkap
                      </div>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Masukkan nama lengkap"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        Email
                      </div>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Masukkan email"
                    />
                  </motion.div>
                </>
              )}

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock size={16} />
                    Password Baru
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
                    placeholder="Masukkan password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ingin mengubah</p>
              </motion.div>

              {/* Organization Fields */}
              {user.role === 'organizer' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="border-t pt-6"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building size={18} />
                    Informasi Organizer
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Organisasi
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Masukkan nama organisasi"
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
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
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-2"
                        >
                          <input
                            type="text"
                            name="custom_organization_type"
                            value={formData.organization_type}
                            onChange={handleCustomOrgTypeChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Masukkan jenis instansi"
                            required
                          />
                        </motion.div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <FileText size={16} />
                          Deskripsi Organisasi
                        </div>
                      </label>
                      <textarea
                        name="organization_description"
                        value={formData.organization_description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Deskripsikan organisasi Anda..."
                      />
                    </div>

                    {/* KTP Information */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin size={16} />
                        Verifikasi KTP
                      </h4>
                      {user.ktp ? (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600 mb-2">KTP telah diunggah dan tidak dapat diubah</p>
                          <a
                            href={user.ktp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline text-sm inline-flex items-center gap-1"
                          >
                            <Eye size={14} />
                            Lihat KTP
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">KTP belum diunggah</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-3 pt-4"
              >
                <motion.button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Batal
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-colors font-medium shadow-md"
                  whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </div>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}