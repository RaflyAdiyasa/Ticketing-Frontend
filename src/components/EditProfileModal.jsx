import { useState, useRef } from "react";
import { userAPI } from "../services/api";
import useNotification from "../hooks/useNotification";

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
  
  const profilePictRef = useRef(null);

  const { showNotification } = useNotification();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fungsi untuk menangani perubahan jenis instansi
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

  // Fungsi untuk menangani perubahan custom organization type
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
      
      // Add fields based on user role
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

      // Untuk organizer, hanya kirim data organisasi jika ada perubahan
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
        // KTP tidak dikirim karena tidak boleh diubah
      }

      if (user.role === 'admin' && formData.password) {
        submitData.append('password', formData.password);
      }

      const response = await userAPI.updateProfile(submitData);
      onUpdate(response.data.user);
      
      showNotification('Profil berhasil diperbarui!', 'Update Berhasil', 'success');
      
      // Clear preview URLs
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-sm w-full max-h-[85vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Edit Profil</h3>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-lg"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common fields for all roles except admin-only password */}
            {(user.role === 'user' || user.role === 'organizer') && (
              <>
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto Profil
                  </label>
                  
                  {/* Preview */}
                  {(previewImages.profile_pict || user.profile_pict) && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-2">Preview:</p>
                      <div className="relative inline-block">
                        <img
                          src={previewImages.profile_pict || user.profile_pict}
                          alt="Profile preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => clearFile('profile_pict')}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={profilePictRef}
                    type="file"
                    name="profile_pict"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ingin mengubah</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Password field for all roles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Baru
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan password baru"
              />
              <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ingin mengubah</p>
            </div>

            {/* Organization fields for organizers */}
            {user.role === 'organizer' && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Informasi Organizer</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Organisasi
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Instansi
                      </label>
                      <select
                        name="organization_type"
                        value={showCustomOrgType ? "Lainnya" : formData.organization_type}
                        onChange={handleOrgTypeChange}
                        className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
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
                      
                      {/* Input custom untuk jenis instansi lainnya */}
                      {showCustomOrgType && (
                        <div className="mt-2">
                          <input
                            type="text"
                            name="custom_organization_type"
                            value={formData.organization_type}
                            onChange={handleCustomOrgTypeChange}
                            className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Masukkan jenis instansi"
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi Organisasi
                      </label>
                      <textarea
                        name="organization_description"
                        value={formData.organization_description}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* KTP Information (Read-only) */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Verifikasi KTP</h4>
                      {user.ktp ? (
                        <div>
                          <p className="text-xs text-gray-600 mb-2">KTP telah diunggah dan tidak dapat diubah</p>
                          <a
                            href={user.ktp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                          >
                            Lihat KTP
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">KTP belum diunggah</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex space-x-2 pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2 px-3 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50 transition duration-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-3 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition duration-200"
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}