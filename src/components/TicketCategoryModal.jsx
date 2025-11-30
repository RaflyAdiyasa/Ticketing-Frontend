import { useState, useEffect, useRef } from "react";
import { Calendar, X, Clock, ChevronDown, Search } from "lucide-react";
import useNotification from "../hooks/useNotification"; 
import { motion, AnimatePresence } from "framer-motion";

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
  const [errorMessage, setErrorMessage] = useState("");
  const dropdownRef = useRef(null);

  const { showNotification } = useNotification();

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

  const filteredCategories = predefinedCategories.filter(category =>
    category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      if (editingTicket) {
        setFormData({
          name: editingTicket.name || "",
          quota: editingTicket.quota || "",
          price: editingTicket.price || "",
          date_start: editingTicket.date_start || eventDates?.start || "",
          date_end: editingTicket.date_end || eventDates?.end || "",
          time_start: editingTicket.time_start || "00:00",
          time_end: editingTicket.time_end || "23:59",
          description: editingTicket.description || ""
        });
        setSearchQuery(editingTicket.name || "");
      } else {
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
      setErrorMessage("");
    }
  }, [isOpen, editingTicket, eventDates]);

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
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Validasi real-time untuk tanggal dan waktu
      if (name === "date_start" || name === "date_end" || name === "time_start" || name === "time_end") {
        const dateStart = new Date(name === "date_start" ? value : prev.date_start);
        const dateEnd = new Date(name === "date_end" ? value : prev.date_end);
        const timeStart = name === "time_start" ? value : prev.time_start;
        const timeEnd = name === "time_end" ? value : prev.time_end;

        if (newData.date_start && newData.date_end) {
          dateStart.setHours(0, 0, 0, 0);
          dateEnd.setHours(0, 0, 0, 0);

          if (dateStart > dateEnd) {
            setErrorMessage("Tanggal mulai tidak boleh lebih besar dari tanggal selesai!");
          } else if (dateStart.getTime() === dateEnd.getTime()) {
            const [startHour, startMinute] = timeStart.split(':').map(Number);
            const [endHour, endMinute] = timeEnd.split(':').map(Number);
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;

            if (startTotalMinutes > endTotalMinutes) {
              setErrorMessage("Jam mulai tidak boleh lebih besar dari jam selesai pada tanggal yang sama!");
            } else if (startTotalMinutes === endTotalMinutes) {
              setErrorMessage("Jam mulai dan jam selesai tidak boleh sama!");
            } else {
              setErrorMessage("");
            }
          } else {
            setErrorMessage("");
          }
        }
      }

      return newData;
    });

    if (name === "name") {
      setSearchQuery(value);
    }
  };

  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
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

  const validateForm = () => {
    if (!formData.name || !formData.quota || !formData.price || !formData.date_start || !formData.date_end) {
      return { isValid: false, message: "Harap isi semua field yang wajib diisi!" };
    }

    const dateStart = new Date(formData.date_start);
    const dateEnd = new Date(formData.date_end);
    
    // Reset time untuk perbandingan tanggal saja
    dateStart.setHours(0, 0, 0, 0);
    dateEnd.setHours(0, 0, 0, 0);

    // Validasi: tanggal mulai tidak boleh lebih besar dari tanggal selesai
    if (dateStart > dateEnd) {
      return { 
        isValid: false, 
        message: "Tanggal mulai tidak boleh lebih besar dari tanggal selesai!" 
      };
    }

    // Validasi waktu jika tanggal sama
    if (dateStart.getTime() === dateEnd.getTime()) {
      const [startHour, startMinute] = formData.time_start.split(':').map(Number);
      const [endHour, endMinute] = formData.time_end.split(':').map(Number);
      
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      if (startTotalMinutes > endTotalMinutes) {
        return { 
          isValid: false, 
          message: "Jam mulai tidak boleh lebih besar dari jam selesai pada tanggal yang sama!" 
        };
      }

      if (startTotalMinutes === endTotalMinutes) {
        return { 
          isValid: false, 
          message: "Jam mulai dan jam selesai tidak boleh sama!" 
        };
      }
    }

    // Validasi datetime lengkap (untuk kasus tanggal berbeda)
    const startDateTime = new Date(`${formData.date_start}T${formData.time_start}`);
    const endDateTime = new Date(`${formData.date_end}T${formData.time_end}`);
    
    if (endDateTime <= startDateTime) {
      return { isValid: false, message: "Tanggal/waktu selesai harus setelah tanggal/waktu mulai!" };
    }

    // Validasi terhadap tanggal event
    if (eventDates?.start && eventDates?.end) {
      const eventStart = new Date(eventDates.start);
      const eventEnd = new Date(eventDates.end);
      
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(23, 59, 59, 999);
      
      const ticketStart = new Date(formData.date_start);
      const ticketEnd = new Date(formData.date_end);
      
      ticketStart.setHours(0, 0, 0, 0);
      ticketEnd.setHours(23, 59, 59, 999);

      if (ticketStart < eventStart) {
        return { 
          isValid: false, 
          message: `Tanggal mulai tiket tidak boleh sebelum tanggal event (${new Date(eventDates.start).toLocaleDateString('id-ID')})` 
        };
      }

      if (ticketEnd > eventEnd) {
        return { 
          isValid: false, 
          message: `Tanggal selesai tiket tidak boleh setelah tanggal event (${new Date(eventDates.end).toLocaleDateString('id-ID')})` 
        };
      }
    }

    return { isValid: true };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.isValid) {
      setErrorMessage(validation.message);
      showNotification(validation.message, "Validasi Gagal", "warning");
      return;
    }

    setErrorMessage("");

    const ticketData = {
      ...formData,
      price: parseFloat(formData.price),
      quota: parseInt(formData.quota),
      id: editingTicket ? editingTicket.id : Date.now()
    };

    if (editingTicket) {
      onUpdateTicket(ticketData);
    } else {
      onAddTicket(ticketData);
    }

    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl"
        >
          {/* Header yang lebih sederhana */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <motion.h2 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold text-gray-800"
              >
                {editingTicket ? "Edit Kategori Tiket" : "Tambah Kategori Tiket"}
              </motion.h2>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full transition-colors"
              >
                <X size={24} />
              </motion.button>
            </div>
            {eventDates?.start && eventDates?.end && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-gray-600 mt-2"
              >
                Tanggal tiket harus dalam rentang event:{" "}
                <span className="font-medium">
                  {new Date(eventDates.start).toLocaleDateString('id-ID')} - {new Date(eventDates.end).toLocaleDateString('id-ID')}
                </span>
              </motion.p>
            )}
          </div>

          {/* Form */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="p-6 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Nama Kategori */}
            <motion.div 
              className="space-y-2 relative" 
              ref={dropdownRef}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
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
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto mt-1"
                    >
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category, index) => (
                          <motion.div
                            key={index}
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                            onClick={() => handleCategorySelect(category)}
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                          >
                            {category}
                          </motion.div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          Tidak ada kategori yang cocok
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-xs text-gray-500">
                Pilih dari kategori umum atau ketik nama kategori custom
              </p>
            </motion.div>

            {/* Grid Kuota & Harga */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
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
            </motion.div>

            {/* Tanggal & Waktu Tiket */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
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
                        max={eventDates?.end || undefined}
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
                        max={eventDates?.end || undefined}
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
              
              {eventDates?.start && eventDates?.end && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Info:</strong> Tanggal tiket harus dalam rentang tanggal event:{" "}
                    <span className="font-medium">
                      {new Date(eventDates.start).toLocaleDateString('id-ID')} hingga {new Date(eventDates.end).toLocaleDateString('id-ID')}
                    </span>
                  </p>
                </div>
              )}
            </motion.div>

            {/* Deskripsi */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
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
              
              {/* Error Message */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-300 rounded-lg p-3 mt-2"
                  >
                    <p className="text-sm text-red-600 font-medium">
                      {errorMessage}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              className="flex gap-4 pt-4 border-t border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Batal
              </motion.button>
              <motion.button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {editingTicket ? "Update Kategori Tiket" : "Tambah Kategori Tiket"}
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}