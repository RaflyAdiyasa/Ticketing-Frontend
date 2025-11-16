// components/TicketCategoryModal.jsx
import { useState, useEffect } from "react";
import { Calendar, X } from "lucide-react";
import useNotification from "../hooks/useNotification"; // Sesuaikan path

export default function TicketCategoryModal({ 
  isOpen, 
  onClose, 
  onAddTicket,
  editingTicket,
  onUpdateTicket 
}) {
  const [formData, setFormData] = useState({
    name: "",
    quota: "",
    price: "",
    date_start: "",
    date_end: "",
    description: ""
  });

  // Gunakan hook useNotification
  const { showNotification } = useNotification();

  // Reset form ketika modal dibuka atau ticket yang diedit berubah
  useEffect(() => {
    if (isOpen) {
      if (editingTicket) {
        setFormData({
          name: editingTicket.name || "",
          quota: editingTicket.quota || "",
          price: editingTicket.price || "",
          date_start: editingTicket.date_start || "",
          date_end: editingTicket.date_end || "",
          description: editingTicket.description || ""
        });
      } else {
        setFormData({
          name: "",
          quota: "",
          price: "",
          date_start: "",
          date_end: "",
          description: ""
        });
      }
    }
  }, [isOpen, editingTicket]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.name || !formData.quota || !formData.price || !formData.date_start || !formData.date_end) {
      showNotification("Harap isi semua field yang wajib diisi!", "Validasi Gagal", "warning");
      return;
    }

    const ticketData = {
      ...formData,
      price: parseFloat(formData.price),
      quota: parseInt(formData.quota),
      id: editingTicket ? editingTicket.id : Date.now()
    };

    if (editingTicket) {
      onUpdateTicket(ticketData);
      showNotification("Kategori tiket berhasil diperbarui!", "Update Berhasil", "success");
    } else {
      onAddTicket(ticketData);
      showNotification("Kategori tiket berhasil ditambahkan!", "Tambah Berhasil", "success");
    }

    onClose();
  };

  const handleCancel = () => {
    onClose();
    showNotification("Proses dibatalkan", "Informasi", "info");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {editingTicket ? "Edit Kategori Tiket" : "Tambah Kategori Tiket"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Nama Kategori */}
          <div className="mb-6">
            <p className="font-medium mb-1">Nama Kategori *</p>
            <input
              type="text"
              name="name"
              className="w-full border rounded-lg p-2"
              placeholder="Contoh: VIP, Reguler, dll"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Grid Kuota & Harga */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="font-medium mb-1">Kuota pengunjung *</p>
              <input 
                type="number" 
                name="quota"
                className="w-full border rounded-lg p-2" 
                placeholder="0"
                min="1"
                value={formData.quota}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <p className="font-medium mb-1">Harga tiket *</p>
              <input 
                type="number" 
                name="price"
                className="w-full border rounded-lg p-2" 
                placeholder="0"
                min="0"
                step="1000"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Tanggal Tiket */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="font-medium mb-1">Tanggal mulai *</p>
              <label className="flex items-center gap-2 border rounded-lg p-2">
                <Calendar size={18} />
                <input 
                  type="date" 
                  name="date_start"
                  className="w-full outline-none" 
                  value={formData.date_start}
                  onChange={handleInputChange}
                  required
                />
              </label>
            </div>

            <div>
              <p className="font-medium mb-1">Tanggal selesai *</p>
              <label className="flex items-center gap-2 border rounded-lg p-2">
                <Calendar size={18} />
                <input 
                  type="date" 
                  name="date_end"
                  className="w-full outline-none" 
                  value={formData.date_end}
                  onChange={handleInputChange}
                  required
                />
              </label>
            </div>
          </div>

          {/* Keterangan */}
          <div className="mb-8">
            <p className="font-medium mb-1">Keterangan Tiket</p>
            <textarea
              rows={4}
              name="description"
              className="w-full border rounded-lg p-2"
              placeholder="Tambahkan detail atau syarat untuk kategori tiket ini"
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 text-lg font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 text-lg font-semibold"
            >
              {editingTicket ? "Update Kategori Tiket" : "Tambah Kategori Tiket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}