import Navbar from "../components/Navbar";
import { Calendar, Folder, Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { eventAPI } from "../services/api";
import TicketCategoryModal from "../components/TicketCategoryModal";
import NotificationModal from "../components/NotificationModal";
import useNotification from "../hooks/useNotification";

export default function EventRegister() {
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } =
    useNotification();

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
  const [ticketList, setTicketList] = useState([]);
  const [loading, setLoading] = useState(false);

  // State untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  // State untuk kategori custom
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Jika yang diubah adalah kategori, cek apakah memilih "Lainnya"
    if (name === "category") {
      if (value === "Lainnya") {
        setShowCustomCategory(true);
        // Reset custom category ketika memilih lainnya
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
    // Update juga formData.category dengan nilai custom
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

  // Fungsi untuk menambah tiket baru
  const handleAddTicket = (ticket) => {
    setTicketList((prev) => [...prev, ticket]);
    showNotification(
      "Kategori tiket berhasil ditambahkan",
      "Sukses",
      "success"
    );
  };

  // Fungsi untuk mengupdate tiket yang sudah ada
  const handleUpdateTicket = (updatedTicket) => {
    setTicketList((prev) =>
      prev.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
    setEditingTicket(null);
    showNotification("Kategori tiket berhasil diperbarui", "Sukses", "success");
  };

  // Fungsi untuk edit tiket
  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  // Fungsi untuk hapus tiket
  const removeTicketCategory = (id) => {
    setTicketList((prev) => prev.filter((ticket) => ticket.id !== id));
    showNotification("Kategori tiket berhasil dihapus", "Sukses", "success");
  };

  // Fungsi untuk buka modal tambah tiket
  const handleAddTicketClick = () => {
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  // Fungsi untuk tutup modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTicket(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (ticketList.length === 0) {
      showNotification(
        "Harap tambahkan minimal satu kategori tiket!",
        "Peringatan",
        "warning"
      );
      setLoading(false);
      return;
    }

    // Validasi kategori custom
    if (showCustomCategory && !customCategory.trim()) {
      showNotification(
        "Harap isi kategori event custom!",
        "Peringatan",
        "warning"
      );
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();

      // Append basic form data
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          // Format tanggal ke RFC3339
          if (key === "date_start" || key === "date_end") {
            const date = new Date(formData[key]);
            submitData.append(key, date.toISOString());
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      // Append files
      if (posterFile) {
        submitData.append("image", posterFile);
      }
      if (bannerFile) {
        submitData.append("flyer", bannerFile);
      }

      // Append ticket categories dengan format yang benar
      if (ticketList.length > 0) {
        const ticketCategories = ticketList.map((ticket) => ({
          name: ticket.name,
          price: parseFloat(ticket.price),
          quota: parseInt(ticket.quota),
          description: ticket.description,
          date_time_start: new Date(
            ticket.date_start + "T00:00:00Z"
          ).toISOString(),
          date_time_end: new Date(ticket.date_end + "T23:59:59Z").toISOString(),
        }));
        submitData.append(
          "ticket_categories",
          JSON.stringify(ticketCategories)
        );
      }

      console.log("Submitting event data:", {
        formData,
        ticketCategories: ticketList.map((t) => ({
          name: t.name,
          price: t.price,
          quota: t.quota,
          date_time_start: new Date(t.date_start + "T00:00:00Z").toISOString(),
          date_time_end: new Date(t.date_end + "T23:59:59Z").toISOString(),
        })),
      });

      const response = await eventAPI.createEvent(submitData);

      if (response.data) {
        clearAllData();
        showNotification(
          "Event berhasil dibuat! Menunggu verifikasi admin.",
          "Sukses",
          "success"
        );

        // Navigate after a short delay to show the notification
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      console.error("Error response:", error.response?.data);
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
      name: "",
      category: "",
      date_start: "",
      date_end: "",
      location: "",
      city: "",
      description: "",
    });
    setPosterFile(null);
    setBannerFile(null);
    setTicketList([]);
    setShowCustomCategory(false);
    setCustomCategory("");
  };

  // Get file names for display
  const getPosterFileName = () => {
    return posterFile ? posterFile.name : "Pilih file";
  };

  const getBannerFileName = () => {
    return bannerFile ? bannerFile.name : "Pilih file";
  };

  return (
    <div>
      <Navbar />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      {/* Modal untuk tambah/edit kategori tiket */}
      <TicketCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddTicket={handleAddTicket}
        onUpdateTicket={handleUpdateTicket}
        editingTicket={editingTicket}
      />

      <div className="min-h-screen bg-gray-200 flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">
          {/* Title */}
          <h1 className="text-2xl font-bold mb-6">Daftarkan Event</h1>

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

                  {/* Kategori Hiburan */}
                  <option value="Musik">Musik</option>
                  <option value="Festival">Festival</option>
                  <option value="Konser">Konser</option>
                  <option value="Film & Teater">Film & Teater</option>

                  {/* Kategori Teknologi */}
                  <option value="Teknologi">Teknologi</option>
                  <option value="Startup">Startup</option>
                  <option value="Workshop IT">Workshop IT</option>
                  <option value="Gaming">Gaming</option>

                  {/* Kategori Edukasi */}
                  <option value="Seminar">Seminar</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Pelatihan">Pelatihan</option>
                  <option value="Webinar">Webinar</option>

                  {/* Kategori Olahraga */}
                  <option value="Olah Raga">Olah Raga</option>
                  <option value="Marathon">Marathon</option>
                  <option value="Esport">Esport</option>

                  {/* Kategori Bisnis & Profesional */}
                  <option value="Bisnis">Bisnis</option>
                  <option value="Networking">Networking</option>
                  <option value="Karir">Karir</option>

                  {/* Kategori Seni & Budaya */}
                  <option value="Pameran Seni">Pameran Seni</option>
                  <option value="Budaya">Budaya</option>
                  <option value="Fotografi">Fotografi</option>

                  {/* Kategori Komunitas */}
                  <option value="Komunitas">Komunitas</option>
                  <option value="Relawan">Relawan</option>
                  <option value="Sosial">Sosial</option>

                  {/* Kategori Kuliner */}
                  <option value="Kuliner">Kuliner</option>
                  <option value="Food Festival">Food Festival</option>

                  {/* Lainnya */}
                  <option value="Lainnya">Lainnya</option>
                </select>

                {/* Input untuk kategori custom */}
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
                <p className="font-medium mb-1">
                  Pilih poster event : (1x1)
                </p>
                <label className="flex items-center gap-2 border rounded-lg p-2 cursor-pointer">
                  <Folder />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "poster")}
                  />
                  <span>{getPosterFileName()}</span>
                </label>
              </div>

              {/* Banner Event */}
              <div>
                <p className="font-medium mb-1">
                  Pilih banner event : (16x6)
                </p>
                <label className="flex items-center gap-2 border rounded-lg p-2 cursor-pointer">
                  <Folder />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "banner")}
                  />
                  <span>{getBannerFileName()}</span>
                </label>
              </div>

              {/* Tanggal Mulai */}
              <div>
                <p className="font-medium mb-1">Tanggal event :</p>
                <label className="flex items-center gap-2 border rounded-lg p-2">
                  <Calendar />
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
                  <Calendar />
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
              className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
                      {t.date_start} - {t.date_end}
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
              className="mt-8 w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 text-lg font-semibold disabled:bg-gray-400"
            >
              {loading ? "Membuat Event..." : "Daftarkan Event"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}