import { useState, useEffect, useRef } from "react";
import { Calendar, X, Clock, ChevronDown, Search } from "lucide-react";
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

  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Gunakan hook useNotification
  const { showNotification } = useNotification();

  // Daftar kategori bawaan
  const predefinedCategories = [
    "Regular",
    "VIP", 
    "VVIP",
    "Anak-anak",
    "Remaja",
    "Dewasa",
    "Early Bird",
    "Presale",
    "General Admission",
    "Student",
    "Senior"
  ];

  // Filter kategori berdasarkan pencarian
  const filteredCategories = predefinedCategories.filter(category =>
    category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        setSearchQuery(editingTicket.name || "");
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
        setSearchQuery("");
      }
    }
  }, [isOpen, editingTicket, eventDates]);

  // Handle click outside untuk menutup dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Jika mengubah field name, update juga search query
    if (name === "name") {
      setSearchQuery(value);
    }
  };

  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    // Tidak perlu memproses value, biarkan newline characters tetap ada
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (category) => {
    setFormData(prev => ({
      ...prev,
      name: category
    }));
    setSearchQuery(category);
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFormData(prev => ({
      ...prev,
      name: value
    }));
    
    // Tampilkan dropdown jika ada input
    if (value.length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery.length > 0 || filteredCategories.length > 0) {
      setShowDropdown(true);
    }
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

    // Pastikan description dengan newline tersimpan dengan benar
    // Tidak perlu processing karena React sudah menjaga newline characters

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
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {editingTicket ? "Edit Kategori Tiket" : "Tambah Kategori Tiket"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nama Kategori */}
          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700">Nama Kategori *</label>
            <div className="relative">
              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
                <Search size={18} className="text-gray-400 mr-3" />
                <input
                  type="text"
                  name="name"
                  className="w-full outline-none bg-transparent"
                  placeholder="Ketik atau pilih kategori..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronDown size={18} className="text-gray-400" />
                </button>
              </div>
              
              {/* Dropdown Suggestions */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto mt-1">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        onClick={() => handleCategorySelect(category)}
                      >
                        {category}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      Tidak ada kategori yang cocok
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Pilih dari kategori umum atau ketik nama kategori custom
            </p>
          </div>

          {/* Grid Kuota & Harga */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Kuota Tiket *</label>
              <input 
                type="number" 
                name="quota"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
                min="1"
                value={formData.quota}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Harga Tiket (Rp) *</label>
              <input 
                type="number" 
                name="price"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tanggal Mulai *</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
                    <Calendar className="text-blue-500 mr-3" size={20} />
                    <input 
                      type="date" 
                      name="date_start"
                      className="w-full outline-none bg-transparent" 
                      value={formData.date_start}
                      onChange={handleInputChange}
                      required
                      min={eventDates?.start || undefined}
                    />
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
                    <Clock className="text-blue-500 mr-3" size={20} />
                    <select
                      name="time_start"
                      className="w-full outline-none bg-transparent"
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
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tanggal Selesai *</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
                    <Calendar className="text-blue-500 mr-3" size={20} />
                    <input 
                      type="date" 
                      name="date_end"
                      className="w-full outline-none bg-transparent" 
                      value={formData.date_end}
                      onChange={handleInputChange}
                      required
                      min={formData.date_start || eventDates?.start || undefined}
                    />
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
                    <Clock className="text-blue-500 mr-3" size={20} />
                    <select
                      name="time_end"
                      className="w-full outline-none bg-transparent"
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
                  </div>
                </div>
              </div>
            </div>
            
            {/* Info tanggal event */}
            {eventDates?.start && eventDates?.end && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Info:</strong> Tanggal event utama: {new Date(eventDates.start).toLocaleDateString('id-ID')} hingga {new Date(eventDates.end).toLocaleDateString('id-ID')}
                </p>
              </div>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Deskripsi Tiket</label>
            <textarea
              rows={4}
              name="description"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical whitespace-pre-wrap"
              placeholder="Tambahkan detail atau syarat untuk kategori tiket ini (tekan Enter untuk baris baru)"
              value={formData.description}
              onChange={handleTextareaChange}
            />
            <p className="text-xs text-gray-500">
              Tekan Enter untuk membuat baris baru. Baris baru akan tetap tersimpan dan ditampilkan.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {editingTicket ? "Update Kategori Tiket" : "Tambah Kategori Tiket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}