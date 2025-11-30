// EditEventPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Calendar, Folder, Plus, Pencil, Trash2, Eye, X, Save, ArrowLeft, Search } from "lucide-react";
import { eventAPI } from "../services/api";
import TicketCategoryModal from "../components/TicketCategoryModal";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";
import { motion } from "framer-motion";

const DISTRICTS = [
  "Tegalrejo", "Jetis", "Gondokusuman", "Danurejan", "Gedongtengen",
  "Ngampilan", "Wirobrajan", "Mantrijeron", "Kraton", "Gondomanan",
  "Pakualaman", "Mergangsan", "Umbulharjo", "Kotagede",
  "Banguntapan", "Sewon", "Kasihan", "Pandak", "Pleret",
  "Bantul", "Imogiri", "Sanden", "Pundong", "Kretek"
];

const YOGYAKARTA_VENUES = [
  { name: "Benteng Vredeburg", district: "Gondomanan", address: "Jl. Margo Mulyo No.6, Ngupasan, Gondomanan" },
  { name: "Taman Pintar Yogyakarta", district: "Gondomanan", address: "Jl. Panembahan Senopati No.1-3, Ngupasan, Gondomanan" },
  { name: "Titik Nol Kilometer Yogyakarta", district: "Gondomanan", address: "Jl. Pangurakan, Ngupasan, Gondomanan" },
  { name: "Museum Sonobudoyo", district: "Gondomanan", address: "Jl. Pangurakan No.6, Ngupasan, Gondomanan" },
  { name: "Keraton Ngayogyakarta Hadiningrat", district: "Kraton", address: "Jl. Rotowijayan Blok No. 1, Panembahan, Kraton" },
  { name: "Alun-Alun Utara", district: "Kraton", address: "Jl. Alun-Alun Utara, Panembahan, Kraton" },
  { name: "Alun-Alun Selatan", district: "Kraton", address: "Jl. Sultan Agung, Patehan, Kraton" },
  { name: "Taman Sari", district: "Kraton", address: "Jl. Taman, Patehan, Kraton" },
  { name: "Museum Diponegoro", district: "Jetis", address: "Jl. HOS Cokroaminoto No.67, Jetis" },
  { name: "Hotel Tentrem Ballroom", district: "Tegalrejo", address: "Jl. P. Mangkubumi No.72A, Gowongan, Tegalrejo" },
  { name: "GOR Amongrogo", district: "Umbulharjo", address: "Jl. Kenari, Semaki, Umbulharjo" },
  { name: "Balai Kota Yogyakarta", district: "Umbulharjo", address: "Jl. Kenari No.56, Semaki, Umbulharjo" },
  { name: "Pusat Kerajinan Perak Kotagede", district: "Kotagede", address: "Jl. Kemasan, Kotagede" },
  { name: "Jogja Expo Center", district: "Banguntapan", address: "Jl. Wonocatur No.1, Banguntapan, Bantul" },
  { name: "Balai Desa Banguntapan Hall", district: "Banguntapan", address: "Jl. Wiyoro Lor, Banguntapan, Bantul" },
  { name: "ISI Yogyakarta Concert Hall", district: "Sewon", address: "Jl. Parangtritis Km 6, Sewon, Bantul" },
  { name: "Taman Gabusan Art Center", district: "Sewon", address: "Jl. Parangtritis Km 5, Timbulharjo, Sewon, Bantul" },
  { name: "Gedung Serbaguna Kasihan", district: "Kasihan", address: "Kasihan, Bantul" },
  { name: "Cinéma Café & Creative Space", district: "Kasihan", address: "Jl. Bibis Raya, Tirtonirmolo, Kasihan" },
  { name: "Balai Budaya Pleret", district: "Pleret", address: "Pleret, Bantul" },
  { name: "Gedung Serbaguna Pandak", district: "Pandak", address: "Pandak, Bantul" },
  { name: "Gedung Muda Budaya Bantul", district: "Bantul", address: "Jl. Jend Sudirman, Bantul" },
  { name: "GRHA 'Wijaya Kusuma' Pemkab Bantul", district: "Bantul", address: "Jl. Lingkar Timur, Bantul" },
  { name: "Aula Balai Desa Imogiri", district: "Imogiri", address: "Imogiri, Bantul" },
  { name: "Pantai Goa Cemara Event Area", district: "Sanden", address: "Patihan, Gadingsari, Sanden, Bantul" },
  { name: "Pantai Parangtritis Event Ground", district: "Kretek", address: "Parangtritis, Kretek, Bantul" },
  { name: "Lainnya", district: "", address: "" }
];

const DescriptionWithNewlines = ({ text }) => {
  if (!text) return null;
  return (
    <div className="text-gray-600 text-sm mb-3 whitespace-pre-line">
      {text}
    </div>
  );
};

const VenueDropdown = ({ value, onChange, onCustomVenueToggle, isCustomVenue }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredVenues = useMemo(() => {
    if (!searchTerm) return YOGYAKARTA_VENUES;
    return YOGYAKARTA_VENUES.filter(venue =>
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSelectVenue = (venue) => {
    if (venue.name === "Lainnya") {
      onCustomVenueToggle(true);
      onChange({ target: { name: "venue", value: "" } });
      setSearchTerm("");
    } else {
      onCustomVenueToggle(false);
      onChange({ target: { name: "venue", value: venue.name } });
      setSearchTerm(venue.name);
      if (venue.district) {
        onChange({ target: { name: "district", value: venue.district } });
      }
      if (venue.address) {
        onChange({ target: { name: "location", value: venue.address } });
      }
    }
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    
    if (isCustomVenue || value !== "") {
      onChange({ target: { name: "venue", value: value } });
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = (e) => {
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleCustomVenueToggle = (custom) => {
    onCustomVenueToggle(custom);
    if (custom) {
      onChange({ target: { name: "venue", value: "" } });
      setSearchTerm("");
    } else {
      onChange({ target: { name: "venue", value: "" } });
      setSearchTerm("");
    }
  };

  const displayValue = isCustomVenue ? value : searchTerm;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-10 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder={isCustomVenue ? "Masukkan nama venue custom..." : "Cari venue..."}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        {(searchTerm || value) && !isCustomVenue && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              onChange({ target: { name: "venue", value: "" } });
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      {!isCustomVenue && isOpen && filteredVenues.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredVenues.map((venue) => (
            <button
              key={venue.name}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
              onClick={() => handleSelectVenue(venue)}
            >
              <div className="font-medium text-gray-900">{venue.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Kecamatan:</span> {venue.district}
              </div>
              <div className="text-sm text-gray-600 truncate">
                <span className="font-medium">Alamat:</span> {venue.address}
              </div>
            </button>
          ))}
        </div>
      )}
      
      <button
        type="button"
        onClick={() => handleCustomVenueToggle(!isCustomVenue)}
        className="text-sm text-blue-600 hover:text-blue-800 mt-2 block"
      >
        {isCustomVenue ? "Pilih dari daftar venue" : "Venue tidak ada di daftar? Klik di sini"}
      </button>
    </div>
  );
};

// Fungsi untuk memformat tanggal menjadi format yang mudah dibaca
const formatDateForDisplay = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function EditEventPage() {
  const { id } = useParams();
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

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [posterFile, setPosterFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [currentPoster, setCurrentPoster] = useState("");
  const [currentBanner, setCurrentBanner] = useState("");
  const [ticketList, setTicketList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [previewImage, setPreviewImage] = useState({
    isOpen: false,
    image: null,
    type: ""
  });
  const [isCustomVenue, setIsCustomVenue] = useState(false);
  const [canOpenModal, setCanOpenModal] = useState(false);
  const [minDate, setMinDate] = useState("");

  // Fetch categories dari API
  const fetchEventCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await eventAPI.getEventCategories();
      const categoriesData = response.data.event_category || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching event categories:", error);
      showNotification("Gagal memuat kategori event", "Error", "error");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchEventCategories();
  }, []);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const response = await eventAPI.getEvent(id);
        const eventData = response.data;

        const token = sessionStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isEventOwner = payload.user_id === eventData.owner_id;
          setIsOwner(isEventOwner);

          if (!isEventOwner) {
            showNotification("Anda tidak memiliki akses untuk mengedit event ini", "Error", "error");
            navigate(`/detailEvent/${id}`);
            return;
          }

          if (eventData.status !== 'pending' && eventData.status !== 'rejected') {
            showNotification("Event hanya dapat diedit ketika status pending atau rejected", "Error", "error");
            navigate(`/detailEvent/${id}`);
            return;
          }
        }

        setEvent(eventData);
        
        // Hitung tanggal minimal berdasarkan createdAt event (7 hari setelah createdAt)
        if (eventData.created_at) {
          const createdAt = new Date(eventData.created_at);
          const minStartDate = new Date(createdAt);
          minStartDate.setDate(minStartDate.getDate() + 7);
          setMinDate(minStartDate.toISOString().split('T')[0]);
        } else {
          // Fallback jika createdAt tidak ada
          const fallbackMinDate = new Date();
          fallbackMinDate.setDate(fallbackMinDate.getDate() + 7);
          setMinDate(fallbackMinDate.toISOString().split('T')[0]);
        }
        
        const isVenueCustom = !YOGYAKARTA_VENUES.some(venue => venue.name === eventData.venue);
        setIsCustomVenue(isVenueCustom);
        
        setFormData({
          name: eventData.name,
          category: eventData.category,
          child_category: eventData.child_category || "",
          date_start: eventData.date_start ? new Date(eventData.date_start).toISOString().split('T')[0] : "",
          date_end: eventData.date_end ? new Date(eventData.date_end).toISOString().split('T')[0] : "",
          location: eventData.location,
          venue: eventData.venue || "",
          district: eventData.district || "",
          description: eventData.description,
          rules: eventData.rules || "",
        });

        setCurrentPoster(eventData.image || "");
        setCurrentBanner(eventData.flyer || "");

        const formattedTickets = eventData.ticket_categories?.map((ticket, index) => ({
          id: ticket.ticket_category_id || `existing-${index}`,
          name: ticket.name,
          quota: ticket.quota,
          price: ticket.price,
          description: ticket.description || "",
          date_start: ticket.date_time_start ? new Date(ticket.date_time_start).toISOString().split('T')[0] : "",
          date_end: ticket.date_time_end ? new Date(ticket.date_time_end).toISOString().split('T')[0] : "",
          time_start: ticket.date_time_start ? new Date(ticket.date_time_start).toTimeString().slice(0, 5) : "00:00",
          time_end: ticket.date_time_end ? new Date(ticket.date_time_end).toTimeString().slice(0, 5) : "23:59",
        })) || [];

        setTicketList(formattedTickets);

      } catch (error) {
        console.error("Error fetching event data:", error);
        showNotification("Gagal memuat data event", "Error", "error");
        navigate("/event-saya");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventData();
    }
  }, [id, navigate, showNotification]);

  // Fungsi validasi tanggal tiket
  const validateTicketDates = (ticketStart, ticketEnd) => {
    if (!formData.date_start || !formData.date_end) {
      return { isValid: false, message: "Harap tentukan tanggal event terlebih dahulu" };
    }

    const eventStart = new Date(formData.date_start);
    const eventEnd = new Date(formData.date_end);
    const ticketStartDate = new Date(ticketStart);
    const ticketEndDate = new Date(ticketEnd);

    // Set waktu untuk perbandingan yang akurat
    eventStart.setHours(0, 0, 0, 0);
    eventEnd.setHours(23, 59, 59, 999);
    ticketStartDate.setHours(0, 0, 0, 0);
    ticketEndDate.setHours(23, 59, 59, 999);

    if (ticketStartDate < eventStart) {
      return { 
        isValid: false, 
        message: `Tanggal mulai tiket tidak boleh sebelum tanggal event (${formatDateForDisplay(formData.date_start)})` 
      };
    }

    if (ticketEndDate > eventEnd) {
      return { 
        isValid: false, 
        message: `Tanggal selesai tiket tidak boleh setelah tanggal event (${formatDateForDisplay(formData.date_end)})` 
      };
    }

    return { isValid: true };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" && { child_category: "" })
    }));

    // Validasi tanggal selesai harus setelah tanggal mulai
    if (name === "date_start" && formData.date_end && value > formData.date_end) {
      setFormData(prev => ({
        ...prev,
        date_end: value
      }));
    }
  };

  const handleVenueChange = (e) => {
    handleInputChange(e);
  };

  const handleCustomVenueToggle = (custom) => {
    setIsCustomVenue(custom);
    if (custom) {
      setFormData(prev => ({
        ...prev,
        venue: "",
        district: "",
        location: ""
      }));
    }
  };

  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (maksimal 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB dalam bytes
      if (file.size > maxSize) {
        showNotification(
          `Ukuran file ${type} terlalu besar! Maksimal 5MB.`,
          "Peringatan",
          "warning"
        );
        e.target.value = ""; // Reset input file
        return;
      }

      // Validasi tipe file (hanya gambar)
      if (!file.type.startsWith('image/')) {
        showNotification(
          `File ${type} harus berupa gambar!`,
          "Peringatan",
          "warning"
        );
        e.target.value = ""; // Reset input file
        return;
      }

      type === "poster" ? setPosterFile(file) : setBannerFile(file);
      showNotification(
        `File ${type} berhasil dipilih!`,
        "Sukses",
        "success"
      );
    }
  };

  const handlePreviewImage = (type) => {
    let imageUrl;
    if (type === 'poster') {
      imageUrl = posterFile ? URL.createObjectURL(posterFile) : currentPoster;
    } else {
      imageUrl = bannerFile ? URL.createObjectURL(bannerFile) : currentBanner;
    }

    if (imageUrl) {
      setPreviewImage({
        isOpen: true,
        image: imageUrl,
        type: type
      });
    }
  };

  const handleClosePreview = () => {
    setPreviewImage({ isOpen: false, image: null, type: "" });
  };

  // Perbaiki handleAddTicket dengan validasi
  const handleAddTicket = (ticket) => {
    // Validasi tanggal tiket terhadap tanggal event
    const validation = validateTicketDates(ticket.date_start, ticket.date_end);
    if (!validation.isValid) {
      showNotification(validation.message, "Validasi Gagal", "warning");
      return;
    }

    setTicketList((prev) => [...prev, ticket]);
    showNotification("Kategori tiket berhasil ditambahkan", "Sukses", "success");
  };

  // Perbaiki handleUpdateTicket dengan validasi
  const handleUpdateTicket = (updatedTicket) => {
    // Validasi tanggal tiket terhadap tanggal event
    const validation = validateTicketDates(updatedTicket.date_start, updatedTicket.date_end);
    if (!validation.isValid) {
      showNotification(validation.message, "Validasi Gagal", "warning");
      return;
    }

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

  // Perbaiki handleAddTicketClick dengan validasi
  const handleAddTicketClick = () => {
    // Validasi apakah tanggal event sudah diisi
    if (!formData.date_start || !formData.date_end) {
      showNotification(
        "Harap tentukan tanggal event terlebih dahulu sebelum menambahkan kategori tiket",
        "Validasi Gagal", 
        "warning"
      );
      return;
    }

    setEditingTicket(null);
    setIsModalOpen(true);
    setCanOpenModal(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTicket(null);
    setCanOpenModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validasi tanggal
    if (minDate && formData.date_start < minDate) {
      showNotification(
        `Tanggal mulai event harus minimal 7 hari setelah event dibuat. Paling cepat ${formatDateForDisplay(minDate)}`,
        "Validasi Gagal",
        "warning"
      );
      setLoading(false);
      return;
    }

    if (ticketList.length === 0) {
      showNotification("Harap tambahkan minimal satu kategori tiket!", "Peringatan", "warning");
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();

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

      if (posterFile) submitData.append("image", posterFile);
      if (bannerFile) submitData.append("flyer", bannerFile);

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

      const response = await eventAPI.updateEvent(id, submitData);

      if (response.data) {
        showNotification("Event berhasil diperbarui!", "Sukses", "success");
        setTimeout(() => navigate(`/detailEvent/${id}`), 2000);
      }
    } catch (error) {
      console.error("Error updating event:", error);
      showNotification(
        `Gagal memperbarui event: ${error.response?.data?.error || error.message}`,
        "Error",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const getPosterFileName = () => {
    return posterFile ? posterFile.name : (currentPoster ? "Poster saat ini" : "Pilih file");
  };

  const getBannerFileName = () => {
    return bannerFile ? bannerFile.name : (currentBanner ? "Banner saat ini" : "Pilih file");
  };

  // Fungsi untuk mendapatkan subkategori berdasarkan kategori yang dipilih
  const getChildCategories = () => {
    const selectedCategory = categories.find(cat => 
      cat.event_category_name === formData.category
    );
    return selectedCategory?.child_event_category || [];
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' },
      'approved': { bg: 'bg-green-100', text: 'text-green-800', label: 'Disetujui' },
      'published': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Dipublikasi' }
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return `${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-medium`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading && !event) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-36">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-lg text-gray-600">Memuat data event...</div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-red-600 text-lg font-semibold mb-2">Akses Ditolak</div>
            <div className="text-gray-600">Anda tidak memiliki akses untuk mengedit event ini</div>
          </motion.div>
        </div>
      </div>
    );
  }

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
        minDate={minDate}
      />

      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mt-32"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
            >
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => navigate(`/detailEvent/${id}`)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={20} />
                  <span className="font-medium">Kembali</span>
                </motion.button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
                  <p className="text-gray-600 mt-2">Perbarui informasi event Anda</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                {event && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 font-medium">Status:</span>
                    <span className={getStatusBadge(event.status)}>
                      {event.status === 'pending' ? 'Pending' : 
                       event.status === 'rejected' ? 'Ditolak' : 
                       event.status === 'approved' ? 'Disetujui' : 
                       event.status === 'published' ? 'Dipublikasi' : event.status}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Informasi Dasar Event */}
              <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-6">
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
                      disabled={loadingCategories}
                    >
                      <option value="">{loadingCategories ? "Memuat kategori..." : "Pilih kategori event"}</option>
                      {categories.map((category) => (
                        <option key={category.event_category_id} value={category.event_category_name}>
                          {category.event_category_name}
                        </option>
                      ))}
                    </select>
                    {loadingCategories && (
                      <p className="text-xs text-gray-500">Sedang memuat kategori...</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Sub Kategori Event *</label>
                    <select
                      name="child_category"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                      value={formData.child_category}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.category || loadingCategories}
                    >
                      <option value="">
                        {!formData.category ? "Pilih kategori terlebih dahulu" : "Pilih sub kategori"}
                      </option>
                      {getChildCategories().map((childCategory) => (
                        <option key={childCategory.child_event_category_id} value={childCategory.child_event_category_name}>
                          {childCategory.child_event_category_name}
                        </option>
                      ))}
                    </select>
                    {formData.category && getChildCategories().length === 0 && (
                      <p className="text-xs text-yellow-600">Tidak ada subkategori untuk kategori ini</p>
                    )}
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
              </motion.div>

              {/* Media Event */}
              <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Media Event</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Poster Event (1:1) *</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-colors flex-1">
                        <Folder className="text-blue-500" size={24} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{getPosterFileName()}</p>
                          <p className="text-xs text-gray-500">
                            {posterFile ? "File baru dipilih" : currentPoster ? "Gunakan file saat ini" : "Klik untuk memilih file (maks. 5MB)"}
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "poster")}
                        />
                      </label>
                      {(posterFile || currentPoster) && (
                        <motion.button
                          type="button"
                          onClick={() => handlePreviewImage('poster')}
                          className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye size={18} />
                          Preview
                        </motion.button>
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
                          <p className="text-xs text-gray-500">
                            {bannerFile ? "File baru dipilih" : currentBanner ? "Gunakan file saat ini" : "Klik untuk memilih file (maks. 5MB)"}
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "banner")}
                        />
                      </label>
                      {(bannerFile || currentBanner) && (
                        <motion.button
                          type="button"
                          onClick={() => handlePreviewImage('banner')}
                          className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye size={18} />
                          Preview
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Waktu & Lokasi */}
              <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-6">
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
                        min={minDate}
                        required
                      />
                    </div>
                    {minDate && (
                      <p className="text-xs text-gray-800">
                        Paling cepat 7 hari setelah event dibuat ({formatDateForDisplay(minDate)})
                      </p>
                    )}
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
                        min={formData.date_start || minDate}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-800">
                      Harus setelah tanggal mulai
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Venue *</label>
                    <VenueDropdown
                      value={formData.venue}
                      onChange={handleVenueChange}
                      onCustomVenueToggle={handleCustomVenueToggle}
                      isCustomVenue={isCustomVenue}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Alamat Lengkap *</label>
                    <textarea
                      name="location"
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                      placeholder="Masukkan alamat lengkap venue"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Deskripsi & Peraturan */}
              <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-6">
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
              </motion.div>

              {/* Kategori Tiket */}
              <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Kategori Tiket</h2>
                  <motion.button
                    type="button"
                    onClick={handleAddTicketClick}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={20} />
                    Tambah Kategori Tiket
                  </motion.button>
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
                      <motion.div 
                        key={t.id} 
                        className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
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
                            <motion.button
                              type="button"
                              onClick={() => handleEditTicket(t)}
                              className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Pencil size={16} />
                              Edit
                            </motion.button>
                            <motion.button
                              type="button"
                              onClick={() => removeTicketCategory(t.id)}
                              className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash2 size={16} />
                              Hapus
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200"
              >
                <motion.button
                  type="button"
                  onClick={() => navigate(`/detailEvent/${id}`)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Batal
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                  whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save size={20} />
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan Perubahan...
                    </div>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}