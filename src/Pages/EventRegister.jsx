import Navbar from "../components/Navbar";
import { Calendar, Folder, Plus, Pencil, Trash2, Eye, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { eventAPI } from "../services/api";
import TicketCategoryModal from "../components/TicketCategoryModal";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";

// Category and Child Category mappings
const CATEGORIES = {
  "Hiburan": ["Musik", "Festival", "Konser", "Film & Teater"],
  "Teknologi": ["Teknologi", "Startup", "Workshop IT", "Gaming"],
  "Edukasi": ["Seminar", "Workshop", "Pelatihan", "Webinar"],
  "Olahraga": ["Olah Raga", "Marathon", "Esport", "Horse Race"],
  "Bisnis & Profesional": ["Bisnis", "Networking", "Karir"],
  "Seni & Budaya": ["Pameran Seni", "Budaya", "Fotografi"],
  "Komunitas": ["Komunitas", "Relawan", "Sosial"],
  "Kuliner": ["Kuliner", "Food Festival"]
};

// District options
const DISTRICTS = [
  "Tegalrejo", "Jetis", "Gondokusuman", "Danurejan", "Gedongtengen", "Ngampilan", "Wirobrajan", "Mantrijeron",
  "Kraton", "Gondomanan", "Pakualaman", "Mergangsan", "Umbulharjo", "Kotagede"
];

// Venue options for Yogyakarta
const YOGYAKARTA_VENUES = [
  { name: "Jogja Expo Center (JEC)", district: "Mantrijeron", address: "Jl. Raya Janti, Jaranan, Banguntapan, Bantul" },
  { name: "Benteng Vredeburg", district: "Gondomanan", address: "Jl. Margo Mulyo No.6, Ngupasan, Gondomanan" },
  { name: "Taman Pintar Yogyakarta", district: "Gondomanan", address: "Jl. Panembahan Senopati No.1-3, Ngupasan, Gondomanan" },
  { name: "Keraton Ngayogyakarta Hadiningrat", district: "Kraton", address: "Jl. Rotowijayan Blok No. 1, Panembahan, Kraton" },
  { name: "Alun-Alun Utara Yogyakarta", district: "Kraton", address: "Jl. Suryatmajan, Panembahan, Kraton" },
  { name: "Alun-Alun Selatan Yogyakarta", district: "Kraton", address: "Jl. Sultan Agung, Patehan, Kraton" },
  { name: "Taman Sari Yogyakarta", district: "Kraton", address: "Jl. Taman, Patehan, Kraton" },
  { name: "Malioboro Street", district: "Gedongtengen", address: "Jl. Malioboro, Suryatmajan, Danurejan" },
  { name: "Pasar Beringharjo", district: "Gedongtengen", address: "Jl. Margo Mulyo No.16, Ngupasan, Gondomanan" },
  { name: "Universitas Gadjah Mada (UGM)", district: "Sleman", address: "Jl. Bulaksumur, Caturtunggal, Depok, Sleman" },
  { name: "Ambarukmo Plaza", district: "Sleman", address: "Jl. Laksda Adisucipto No.208, Caturtunggal, Sleman" },
  { name: "Hartono Mall Yogyakarta", district: "Sleman", address: "Jl. Ring Road Utara, Mlangi, Nogotirto, Gamping, Sleman" },
  { name: "Jogja City Mall", district: "Sleman", address: "Jl. Magelang Km. 6 No.18, Sinduadi, Mlati, Sleman" },
  { name: "Plaza Ambarrukmo", district: "Sleman", address: "Jl. Laksda Adisucipto No.208, Caturtunggal, Sleman" },
  { name: "Saphir Square Mall", district: "Sleman", address: "Jl. Laksda Adisucipto No.208, Demangan, Gondokusuman" },
  { name: "Titik Nol Kilometer Yogyakarta", district: "Gondomanan", address: "Jl. Pangurakan, Ngupasan, Gondomanan" },
  { name: "Museum Sonobudoyo", district: "Gondomanan", address: "Jl. Pangurakan No.6, Ngupasan, Gondomanan" },
  { name: "Candi Prambanan", district: "Sleman", address: "Jl. Raya Solo - Yogyakarta No.16, Kranggan, Bokoharjo, Prambanan, Sleman" },
  { name: "Candi Borobudur", district: "Magelang", address: "Jl. Badrawati, Borobudur, Magelang" },
  { name: "Taman Budaya Yogyakarta", district: "Gondokusuman", address: "Jl. Sri Wedari No.1, Baciro, Gondokusuman" },
  { name: "Auditorium UGM", district: "Sleman", address: "Jl. Olahraga, Caturtunggal, Depok, Sleman" },
  { name: "Gedung Societet Militer", district: "Gondomanan", address: "Jl. Malioboro No.60, Suryatmajan, Danurejan" },
  { name: "Gedung PKKH UGM", district: "Sleman", address: "Jl. Olahraga, Bulaksumur, Caturtunggal, Sleman" },
  { name: "Convention Hall UGM", district: "Sleman", address: "Jl. Pancasila, Bulaksumur, Caturtunggal, Sleman" },
  { name: "Gedung Serba Guna UIN Sunan Kalijaga", district: "Sleman", address: "Jl. Marsda Adisucipto, Caturtunggal, Depok, Sleman" },
  { name: "GOR Among Raga", district: "Sleman", address: "Jl. Ring Road Utara, Maguwoharjo, Depok, Sleman" },
  { name: "GOR Tri Dharma", district: "Sleman", address: "Jl. Colombo No.1, Caturtunggal, Depok, Sleman" },
  { name: "Stadion Mandala Krida", district: "Gondokusuman", address: "Jl. Bintaran Kulon No.14, Bintaran, Gondokusuman" },
  { name: "Lapangan Kridosono", district: "Gedongtengen", address: "Jl. Kridosono, Suryatmajan, Danurejan" },
  { name: "Taman Kuliner UGM", district: "Sleman", address: "Jl. Olahraga, Bulaksumur, Caturtunggal, Sleman" },
  { name: "Food Festival Jogja", district: "Sleman", address: "Jl. Ring Road Utara, Mlangi, Nogotirto, Gamping, Sleman" },
  { name: "Piazza Food Court", district: "Sleman", address: "Jl. Laksda Adisucipto No.208, Demangan, Gondokusuman" },
  { name: "Lainnya", district: "", address: "" }
];

// Komponen untuk menampilkan deskripsi dengan newline
const DescriptionWithNewlines = ({ text }) => {
  if (!text) return null;
  
  return (
    <div className="text-gray-600 text-sm mb-3 whitespace-pre-line">
      {text}
    </div>
  );
};

export default function EventRegister() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    child_category: "",
    date_start: "",
    date_end: "",
    location: "",
    venue: "",
    district: "",
    description: "",
    rules: "",
  });

  const [posterFile, setPosterFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [ticketList, setTicketList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [previewImage, setPreviewImage] = useState({
    isOpen: false,
    image: null,
    type: ""
  });
  const [isCustomVenue, setIsCustomVenue] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" && { child_category: "" })
    }));
  };

  const handleVenueChange = (e) => {
    const selectedVenue = e.target.value;
    
    if (selectedVenue === "Lainnya") {
      setIsCustomVenue(true);
      setFormData(prev => ({
        ...prev,
        venue: "",
        district: "",
        location: ""
      }));
    } else {
      setIsCustomVenue(false);
      const venueData = YOGYAKARTA_VENUES.find(venue => venue.name === selectedVenue);
      if (venueData) {
        setFormData(prev => ({
          ...prev,
          venue: venueData.name,
          district: venueData.district,
          location: venueData.address
        }));
      }
    }
  };

  const handleCustomVenueChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      type === "poster" ? setPosterFile(file) : setBannerFile(file);
    }
  };

  const handlePreviewImage = (type) => {
    const file = type === 'poster' ? posterFile : bannerFile;
    if (file) {
      setPreviewImage({
        isOpen: true,
        image: URL.createObjectURL(file),
        type: type
      });
    }
  };

  const handleClosePreview = () => {
    setPreviewImage({ isOpen: false, image: null, type: "" });
  };

  const handleAddTicket = (ticket) => {
    setTicketList((prev) => [...prev, ticket]);
    showNotification("Kategori tiket berhasil ditambahkan", "Sukses", "success");
  };

  const handleUpdateTicket = (updatedTicket) => {
    setTicketList((prev) =>
      prev.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
    setEditingTicket(null);
    showNotification("Kategori tiket berhasil diperbarui", "Sukses", "success");
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const removeTicketCategory = (id) => {
    setTicketList((prev) => prev.filter((ticket) => ticket.id !== id));
    showNotification("Kategori tiket berhasil dihapus", "Sukses", "success");
  };

  const handleAddTicketClick = () => {
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTicket(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (ticketList.length === 0) {
      showNotification("Harap tambahkan minimal satu kategori tiket!", "Peringatan", "warning");
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();

      // Append basic form data
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          if (key === "date_start" || key === "date_end") {
            const date = new Date(formData[key]);
            submitData.append(key, date.toISOString());
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      // Append files
      if (posterFile) submitData.append("image", posterFile);
      if (bannerFile) submitData.append("flyer", bannerFile);

      // Append ticket categories
      if (ticketList.length > 0) {
        const ticketCategories = ticketList.map((ticket) => ({
          name: ticket.name,
          price: parseFloat(ticket.price),
          quota: parseInt(ticket.quota),
          description: ticket.description,
          date_time_start: new Date(ticket.date_start + "T" + ticket.time_start + ":00Z").toISOString(),
          date_time_end: new Date(ticket.date_end + "T" + ticket.time_end + ":00Z").toISOString(),
        }));
        submitData.append("ticket_categories", JSON.stringify(ticketCategories));
      }

      const response = await eventAPI.createEvent(submitData);

      if (response.data) {
        clearAllData();
        showNotification("Event berhasil dibuat! Menunggu verifikasi admin.", "Sukses", "success");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      showNotification(
        `Gagal membuat event: ${error.response?.data?.error || error.message}`,
        "Error",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = () => {
    setFormData({
      name: "", category: "", child_category: "", date_start: "", date_end: "",
      location: "", venue: "", district: "", description: "", rules: "",
    });
    setPosterFile(null);
    setBannerFile(null);
    setTicketList([]);
    setIsCustomVenue(false);
  };

  const getPosterFileName = () => posterFile ? posterFile.name : "Pilih file";
  const getBannerFileName = () => bannerFile ? bannerFile.name : "Pilih file";
  const getChildCategories = () => CATEGORIES[formData.category] || [];

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

      {previewImage.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">
                Preview {previewImage.type === 'poster' ? 'Poster' : 'Banner'}
              </h3>
              <button onClick={handleClosePreview} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <img 
                src={previewImage.image} 
                alt={`Preview ${previewImage.type}`}
                className="max-w-full max-h-[70vh] object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}

      <TicketCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddTicket={handleAddTicket}
        onUpdateTicket={handleUpdateTicket}
        editingTicket={editingTicket}
        eventDates={{ start: formData.date_start, end: formData.date_end }}
      />

      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mt-32">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Daftarkan Event</h1>
              <p className="text-gray-600 mt-2">Isi informasi event Anda dengan lengkap dan benar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informasi Dasar Event */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Informasi Dasar Event</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Nama Event *</label>
                    <input
                      type="text"
                      name="name"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Masukkan nama event"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Kategori Event *</label>
                    <select
                      name="category"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Pilih kategori event</option>
                      {Object.keys(CATEGORIES).map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Sub Kategori Event *</label>
                    <select
                      name="child_category"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                      value={formData.child_category}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.category}
                    >
                      <option value="">Pilih sub kategori</option>
                      {getChildCategories().map((childCategory) => (
                        <option key={childCategory} value={childCategory}>{childCategory}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Kecamatan *</label>
                    <select
                      name="district"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Pilih kecamatan</option>
                      {DISTRICTS.map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Media Event */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Media Event</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Poster Event (1:1) *</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-colors flex-1">
                        <Folder className="text-blue-500" size={24} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{getPosterFileName()}</p>
                          <p className="text-xs text-gray-500">Klik untuk memilih file</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "poster")}
                        />
                      </label>
                      {posterFile && (
                        <button
                          type="button"
                          onClick={() => handlePreviewImage('poster')}
                          className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Eye size={18} />
                          Preview
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Banner Event (16:6) *</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-colors flex-1">
                        <Folder className="text-blue-500" size={24} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{getBannerFileName()}</p>
                          <p className="text-xs text-gray-500">Klik untuk memilih file</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "banner")}
                        />
                      </label>
                      {bannerFile && (
                        <button
                          type="button"
                          onClick={() => handlePreviewImage('banner')}
                          className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Eye size={18} />
                          Preview
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Waktu & Lokasi */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Waktu & Lokasi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Tanggal Mulai *</label>
                    <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
                      <Calendar className="text-blue-500 mr-3" size={20} />
                      <input
                        type="date"
                        name="date_start"
                        className="w-full outline-none bg-transparent"
                        value={formData.date_start}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Tanggal Selesai *</label>
                    <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
                      <Calendar className="text-blue-500 mr-3" size={20} />
                      <input
                        type="date"
                        name="date_end"
                        className="w-full outline-none bg-transparent"
                        value={formData.date_end}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Venue *</label>
                    {!isCustomVenue ? (
                      <select
                        name="venue"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={formData.venue}
                        onChange={handleVenueChange}
                        required
                      >
                        <option value="">Pilih venue</option>
                        {YOGYAKARTA_VENUES.map((venue) => (
                          <option key={venue.name} value={venue.name}>
                            {venue.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="venue"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Masukkan nama venue"
                        value={formData.venue}
                        onChange={handleCustomVenueChange}
                        required
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setIsCustomVenue(!isCustomVenue)}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                    >
                      {isCustomVenue ? "Pilih dari daftar venue" : "Venue tidak ada di daftar? Klik di sini"}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Alamat Lengkap *</label>
                    <textarea
                      name="location"
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                      placeholder="Masukkan alamat lengkap venue"
                      value={formData.location}
                      onChange={handleCustomVenueChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Deskripsi & Peraturan */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Informasi Tambahan</h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Deskripsi Event *</label>
                    <textarea
                      rows={4}
                      name="description"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                      placeholder="Jelaskan detail event Anda (tekan Enter untuk baris baru)"
                      value={formData.description}
                      onChange={handleTextareaChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Peraturan Event</label>
                    <textarea
                      rows={4}
                      name="rules"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                      placeholder="Masukkan peraturan event (tekan Enter untuk baris baru)"
                      value={formData.rules}
                      onChange={handleTextareaChange}
                    />
                  </div>
                </div>
              </div>

              {/* Kategori Tiket */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Kategori Tiket</h2>
                  <button
                    type="button"
                    onClick={handleAddTicketClick}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                    Tambah Kategori Tiket
                  </button>
                </div>

                <div className="space-y-4">
                  {ticketList.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                      <Folder className="mx-auto text-gray-400 mb-3" size={48} />
                      <p className="text-gray-500 font-medium">Belum ada kategori tiket</p>
                      <p className="text-gray-400 text-sm mt-1">Klik tombol di atas untuk menambahkan kategori tiket pertama</p>
                    </div>
                  ) : (
                    ticketList.map((t) => (
                      <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">{t.name}</h3>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Rp {parseFloat(t.price).toLocaleString("id-ID")}
                              </span>
                            </div>
                            {t.description && (
                              <DescriptionWithNewlines text={t.description} />
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                              <div>
                                <span className="font-medium">Kuota:</span> {t.quota} tiket
                              </div>
                              <div>
                                <span className="font-medium">Mulai:</span> {t.date_start} {t.time_start}
                              </div>
                              <div>
                                <span className="font-medium">Selesai:</span> {t.date_end} {t.time_end}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              type="button"
                              onClick={() => handleEditTicket(t)}
                              className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Pencil size={16} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeTicketCategory(t.id)}
                              className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={16} />
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Membuat Event..." : "Daftarkan Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}