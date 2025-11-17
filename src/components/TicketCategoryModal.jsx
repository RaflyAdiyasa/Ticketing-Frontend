import { useState, useEffect } from "react";
import { Calendar, X, Clock } from "lucide-react";
import useNotification from "../hooks/useNotification"; 

export default function TicketCategoryModal({ 
  isOpen, 
  onClose, 
  onAddTicket,
  editingTicket,
  onUpdateTicket,
  eventDates 
}) {
  const [formData, setFormData] = useState({
    name: "",
    quota: "",
    price: "",
    date_start: "",
    date_end: "",
    time_start: "00:00",
    time_end: "23:59",
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
          time_start: editingTicket.time_start || "00:00",
          time_end: editingTicket.time_end || "23:59",
          description: editingTicket.description || ""
        });
      } else {
        // Set default dates from event dates if available
        setFormData({
          name: "",
          quota: "",
          price: "",
          date_start: eventDates?.start || "",
          date_end: eventDates?.end || "",
          time_start: "00:00",
          time_end: "23:59",
          description: ""
        });
      }
    }
  }, [isOpen, editingTicket, eventDates]);

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

    // Validasi tanggal
    const startDateTime = new Date(`${formData.date_start}T${formData.time_start}`);
    const endDateTime = new Date(`${formData.date_end}T${formData.time_end}`);
    
    if (endDateTime <= startDateTime) {
      showNotification("Tanggal/waktu selesai harus setelah tanggal/waktu mulai!", "Validasi Gagal", "warning");
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

  // Generate time options
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

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
                className="w-full border rounded-lg p-2
             [&::-webkit-outer-spin-button]:bg-white
             [&::-webkit-outer-spin-button]:rounded-r-md
             [&::-webkit-inner-spin-button]:bg-black 
             [&::-webkit-inner-spin-button]:rounded-r-md
             [&::-webkit-inner-spin-button]:mr-1" 
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
                className="w-full border rounded-lg p-2
                         [&::-webkit-outer-spin-button]:bg-white
                         [&::-webkit-outer-spin-button]:rounded-r-md
                         [&::-webkit-inner-spin-button]:bg-black 
                         [&::-webkit-inner-spin-button]:rounded-r-md
                         [&::-webkit-inner-spin-button]:mr-1" 
                placeholder="0"
                min="0"
                step="1000"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Tanggal & Waktu Tiket */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium mb-1">Tanggal mulai *</p>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 border rounded-lg p-2 flex-1">
                    <Calendar size={18} color="#0C8CE9" />
                    <input 
                      type="date" 
                      name="date_start"
                      className="w-full outline-none" 
                      value={formData.date_start}
                      onChange={handleInputChange}
                      required
                      min={eventDates?.start || undefined}
                    />
                  </label>
                  <label className="flex items-center gap-2 border rounded-lg p-2 flex-1">
                    <Clock size={18} color="#0C8CE9" />
                    <select
                      name="time_start"
                      className="w-full outline-none bg-white"
                      value={formData.time_start}
                      onChange={handleInputChange}
                      required
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div>
                <p className="font-medium mb-1">Tanggal selesai *</p>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 border rounded-lg p-2 flex-1">
                    <Calendar size={18} color="#0C8CE9"/>
                    <input 
                      type="date" 
                      name="date_end"
                      className="w-full outline-none" 
                      value={formData.date_end}
                      onChange={handleInputChange}
                      required
                      min={formData.date_start || eventDates?.start || undefined}
                    />
                  </label>
                  <label className="flex items-center gap-2 border rounded-lg p-2 flex-1">
                    <Clock size={18} color="#0C8CE9"/>
                    <select
                      name="time_end"
                      className="w-full outline-none bg-white"
                      value={formData.time_end}
                      onChange={handleInputChange}
                      required
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Info tanggal event */}
            {eventDates?.start && eventDates?.end && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Info:</strong> Tanggal event utama: {eventDates.start} hingga {eventDates.end}
                </p>
              </div>
            )}
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
              className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-400 text-lg font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#044888] text-white py-3 rounded-lg hover:bg-[#0C8CE9] text-lg font-semibold"
            >
              {editingTicket ? "Update Kategori Tiket" : "Tambah Kategori Tiket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}