import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Calendar, Folder, Plus, Pencil, Trash2, Eye, X, Save, ArrowLeft } from "lucide-react";
import { eventAPI } from "../services/api";
import TicketCategoryModal from "../components/TicketCategoryModal";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    date_start: "",
    date_end: "",
    location: "",
    city: "",
    description: "",
  });

  const [posterFile, setPosterFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [currentPoster, setCurrentPoster] = useState("");
  const [currentBanner, setCurrentBanner] = useState("");
  const [ticketList, setTicketList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // State untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  // State untuk kategori custom
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  // State untuk preview gambar
  const [previewImage, setPreviewImage] = useState({
    isOpen: false,
    image: null,
    type: "" // 'poster' or 'banner'
  });

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const response = await eventAPI.getEvent(id);
        const eventData = response.data;

        // Check if user is owner and event can be edited
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
        
        // Set form data
        setFormData({
          name: eventData.name,
          category: eventData.category,
          date_start: eventData.date_start ? new Date(eventData.date_start).toISOString().split('T')[0] : "",
          date_end: eventData.date_end ? new Date(eventData.date_end).toISOString().split('T')[0] : "",
          location: eventData.location,
          city: eventData.city,
          description: eventData.description,
        });

        // Set current images
        setCurrentPoster(eventData.image || "");
        setCurrentBanner(eventData.flyer || "");

        // Set ticket categories
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

        // Check if category is custom
        const predefinedCategories = [
          "Musik", "Festival", "Konser", "Film & Teater", "Teknologi", "Startup", 
          "Workshop IT", "Gaming", "Seminar", "Workshop", "Pelatihan", "Webinar",
          "Olah Raga", "Marathon", "Esport", "Horse Race", "Bisnis", "Networking",
          "Karir", "Pameran Seni", "Budaya", "Fotografi", "Komunitas", "Relawan",
          "Sosial", "Kuliner", "Food Festival", "Lainnya"
        ];

        if (!predefinedCategories.includes(eventData.category)) {
          setShowCustomCategory(true);
          setCustomCategory(eventData.category);
        }

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "category") {
      if (value === "Lainnya") {
        setShowCustomCategory(true);
        setCustomCategory("");
      } else {
        setShowCustomCategory(false);
        setCustomCategory("");
      }
    }
  };

  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === "poster") {
        setPosterFile(file);
      } else if (type === "banner") {
        setBannerFile(file);
      }
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
    setPreviewImage({
      isOpen: false,
      image: null,
      type: ""
    });
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

    if (showCustomCategory && !customCategory.trim()) {
      showNotification("Harap isi kategori event custom!", "Peringatan", "warning");
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

      // Append files if changed
      if (posterFile) {
        submitData.append("image", posterFile);
      }
      if (bannerFile) {
        submitData.append("flyer", bannerFile);
      }

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

      const response = await eventAPI.updateEvent(id, submitData);

      if (response.data) {
        showNotification("Event berhasil diperbarui!", "Sukses", "success");

        setTimeout(() => {
          navigate(`/detailEvent/${id}`);
        }, 2000);
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

  if (loading && !event) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center pt-36">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-lg">Memuat data event...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center pt-36">
          <div className="text-lg text-red-600">Anda tidak memiliki akses untuk mengedit event ini</div>
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
              <button
                onClick={handleClosePreview}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
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
        eventDates={{
          start: formData.date_start,
          end: formData.date_end
        }}
      />

      <div className="min-h-screen bg-gray-200 flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">
          {/* Header dengan tombol kembali */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/detailEvent/${id}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft size={20} />
                Kembali ke Detail Event
              </button>
              <h1 className="text-2xl font-bold">Edit Event</h1>
            </div>
            {event && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                event.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                Status: {event.status === 'pending' ? 'Pending' : 'Ditolak'}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {/* FORM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Event */}
              <div>
                <p className="font-medium mb-1">Nama Event :</p>
                <input
                  type="text"
                  name="name"
                  className="w-full border rounded-lg p-2"
                  placeholder="Masukkan nama event"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Kategori Event */}
              <div>
                <p className="font-medium mb-1">Kategori Event :</p>
                <select
                  name="category"
                  className="w-full border rounded-lg p-2"
                  value={showCustomCategory ? "Lainnya" : formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Pilih kategori event</option>
                  <option value="Musik">Musik</option>
                  <option value="Festival">Festival</option>
                  <option value="Konser">Konser</option>
                  <option value="Film & Teater">Film & Teater</option>
                  <option value="Teknologi">Teknologi</option>
                  <option value="Startup">Startup</option>
                  <option value="Workshop IT">Workshop IT</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Pelatihan">Pelatihan</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Olah Raga">Olah Raga</option>
                  <option value="Marathon">Marathon</option>
                  <option value="Esport">Esport</option>
                  <option value="Horse Race">Horse Race</option>
                  <option value="Bisnis">Bisnis</option>
                  <option value="Networking">Networking</option>
                  <option value="Karir">Karir</option>
                  <option value="Pameran Seni">Pameran Seni</option>
                  <option value="Budaya">Budaya</option>
                  <option value="Fotografi">Fotografi</option>
                  <option value="Komunitas">Komunitas</option>
                  <option value="Relawan">Relawan</option>
                  <option value="Sosial">Sosial</option>
                  <option value="Kuliner">Kuliner</option>
                  <option value="Food Festival">Food Festival</option>
                  <option value="Lainnya">Lainnya</option>
                </select>

                {showCustomCategory && (
                  <div className="mt-2">
                    <p className="font-medium mb-1">Kategori Custom :</p>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2"
                      placeholder="Masukkan kategori event custom"
                      value={customCategory}
                      onChange={handleCustomCategoryChange}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Poster Event */}
              <div>
                <p className="font-medium mb-1">Pilih poster event : (1x1)</p>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 border rounded-lg p-2 cursor-pointer flex-1">
                    <Folder color="#0C8CE9"/>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "poster")}
                    />
                    <span className="flex-1">{getPosterFileName()}</span>
                  </label>
                  {(posterFile || currentPoster) && (
                    <button
                      type="button"
                      onClick={() => handlePreviewImage('poster')}
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200"
                    >
                      <Eye size={16} />
                      Preview
                    </button>
                  )}
                </div>
              </div>

              {/* Banner Event */}
              <div>
                <p className="font-medium mb-1">Pilih banner event : (16x6)</p>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 border rounded-lg p-2 cursor-pointer flex-1">
                    <Folder color="#0C8CE9"/>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "banner")}
                    />
                    <span className="flex-1">{getBannerFileName()}</span>
                  </label>
                  {(bannerFile || currentBanner) && (
                    <button
                      type="button"
                      onClick={() => handlePreviewImage('banner')}
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200"
                    >
                      <Eye size={16} />
                      Preview
                    </button>
                  )}
                </div>
              </div>

              {/* Tanggal Mulai */}
              <div>
                <p className="font-medium mb-1">Tanggal event :</p>
                <label className="flex items-center gap-2 border rounded-lg p-2">
                  <Calendar color="#0C8CE9"/>
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

              {/* Tanggal Selesai */}
              <div>
                <p className="font-medium mb-1">Tanggal event berakhir :</p>
                <label className="flex items-center gap-2 border rounded-lg p-2">
                  <Calendar color="#0C8CE9"/>
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

              {/* Lokasi */}
              <div>
                <p className="font-medium mb-1">Lokasi Event :</p>
                <input
                  type="text"
                  name="location"
                  className="w-full border rounded-lg p-2"
                  placeholder="Masukkan lokasi event"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Kota */}
              <div>
                <p className="font-medium mb-1">Kota :</p>
                <input
                  type="text"
                  name="city"
                  className="w-full border rounded-lg p-2"
                  placeholder="Masukkan kota"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="mt-6">
              <p className="font-medium mb-1">Deskripsi event :</p>
              <textarea
                rows={4}
                name="description"
                className="w-full border rounded-lg p-2"
                placeholder="Masukkan deskripsi event"
                value={formData.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            {/* Tombol Tambah Kategori Tiket */}
            <button
              type="button"
              onClick={handleAddTicketClick}
              className="mt-6 flex items-center gap-2 bg-[#044888] text-white px-4 py-2 rounded-lg hover:bg-[#0C8CE9]"
            >
              <Plus />
              Tambah Kategori Tiket
            </button>

            {/* LIST KATEGORI TIKET */}
            <div className="mt-6 space-y-4">
              {ticketList.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Belum ada kategori tiket. Klik tombol di atas untuk menambah.
                </p>
              ) : (
                ticketList.map((t) => (
                  <div key={t.id} className="border rounded-lg p-4 shadow-sm">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-gray-600">{t.description}</p>
                    <p className="text-lg font-bold mt-1">
                      Rp {parseFloat(t.price).toLocaleString("id-ID")}
                    </p>
                    <p className="text-sm text-gray-600">Kuota: {t.quota}</p>
                    <p className="text-sm text-gray-600">
                      {t.date_start} {t.time_start} - {t.date_end} {t.time_end}
                    </p>

                    <div className="flex gap-4 mt-3">
                      <button
                        type="button"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        onClick={() => handleEditTicket(t)}
                      >
                        <Pencil size={18} /> Edit
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1 text-red-700 hover:text-red-900"
                        onClick={() => removeTicketCategory(t.id)}
                      >
                        <Trash2 size={18} /> Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full bg-[#044888] text-white py-3 rounded-lg hover:bg-[#0C8CE9] text-lg font-semibold disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}