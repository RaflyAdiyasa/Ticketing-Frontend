import { useState, useRef } from "react";
import { userAPI } from "../services/api";
import useNotification from "../hooks/useNotification"; // Sesuaikan path

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    password: '',
    profile_pict: null,
    organization: user.organization || '',
    organization_type: user.organization_type || '',
    organization_description: user.organization_description || '',
    ktp: null
  });
  const [previewImages, setPreviewImages] = useState({
    profile_pict: user.profile_pict || '',
    ktp: user.ktp || ''
  });
  const [loading, setLoading] = useState(false);
  
  const profilePictRef = useRef(null);
  const ktpRef = useRef(null);

  // Gunakan hook useNotification
  const { showNotification } = useNotification();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

      // Create preview URL
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
      [fieldName]: user[fieldName] || '' // Kembali ke gambar sebelumnya
    }));

    // Reset input file
    if (fieldName === 'profile_pict' && profilePictRef.current) {
      profilePictRef.current.value = '';
    }
    if (fieldName === 'ktp' && ktpRef.current) {
      ktpRef.current.value = '';
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

      if (user.role === 'organizer') {
        submitData.append('organization', formData.organization);
        submitData.append('organization_type', formData.organization_type);
        submitData.append('organization_description', formData.organization_description);
        if (formData.ktp) {
          submitData.append('ktp', formData.ktp);
        }
      }

      if (user.role === 'admin' && formData.password) {
        submitData.append('password', formData.password);
      }

      const response = await userAPI.updateProfile(submitData);
      onUpdate(response.data.user);
      
      // Show success notification
      showNotification('Profil berhasil diperbarui!', 'Update Berhasil', 'success');
      
      // Clear preview URLs
      Object.values(previewImages).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });

      // Clear password field after successful update
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Gagal memperbarui profil', 'Update Gagal', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Clean up preview URLs when component unmounts
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
                        Tipe Organisasi
                      </label>
                      <select
                        name="organization_type"
                        value={formData.organization_type}
                        onChange={handleInputChange}
                        className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Pilih Tipe Organisasi</option>
                        <option value="company">Perusahaan</option>
                        <option value="community">Komunitas</option>
                        <option value="educational">Lembaga Pendidikan</option>
                        <option value="government">Pemerintah</option>
                        <option value="other">Lainnya</option>
                      </select>
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