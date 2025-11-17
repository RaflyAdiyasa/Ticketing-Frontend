import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { MapPin, CalendarDays, Grid3X3, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api, { eventAPI } from "../services/api";
import useNotification from "../hooks/useNotification";
import NotificationModal from "../components/NotificationModal";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatDate = (dateStart, dateEnd) => {
    const start = new Date(dateStart);
    const end = new Date(dateEnd);

    const formatOptions = { day: "numeric", month: "short", year: "numeric" };
    const startFormatted = start.toLocaleDateString("id-ID", formatOptions);
    const endFormatted = end.toLocaleDateString("id-ID", formatOptions);

    if (startFormatted === endFormatted) {
      return startFormatted;
    }
    return `${startFormatted} - ${endFormatted}`;
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEO, setIsEO] = useState(false);
  const [isRegularUser, setIsRegularUser] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationAction, setVerificationAction] = useState(null);
  const [approvalComment, setApprovalComment] = useState("");

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/event/${id}`);
        const eventData = response.data;

        setEvent(eventData);

        const formattedTickets = eventData.ticket_categories?.map((ticket) => ({
          ticket_category_id: ticket.ticket_category_id,
          type: ticket.name,
          desc: ticket.description || "Tiket masuk event",
          price: ticket.price,
          stock: ticket.quota - (ticket.sold || 0),
          quota: ticket.quota,
          sold: ticket.sold || 0,
          date_time_start: ticket.date_time_start,
          date_time_end: ticket.date_time_end,
          qty: 0,
        })) || [];

        setTickets(formattedTickets);
        checkUserRoleAndOwnership(eventData);

      } catch (err) {
        console.error("Error fetching event detail:", err);
        setError("Gagal memuat detail event");
        showNotification("Gagal memuat detail event", "Error", "error");
      } finally {
        setLoading(false);
      }
    };

    const checkUserRoleAndOwnership = (eventData) => {
      try {
        const token = sessionStorage.getItem('token');
        if (token) {
          setIsLoggedIn(true);
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isEventOwner = payload.user_id === eventData.owner_id;
          const isAdminUser = payload.role === 'admin';
          const isEOUser = payload.role === 'organizer';
          
          setIsOwner(isEventOwner);
          setIsAdmin(isAdminUser);
          setIsEO(isEOUser);
          setIsRegularUser(payload.role === 'user' && !isEventOwner && !isAdminUser && !isEOUser);
        } else {
          setIsLoggedIn(false);
          setIsOwner(false);
          setIsAdmin(false);
          setIsEO(false);
          setIsRegularUser(false);
        }
      } catch (err) {
        console.error('Error checking user role:', err);
        setIsLoggedIn(false);
        setIsOwner(false);
        setIsAdmin(false);
        setIsEO(false);
        setIsRegularUser(false);
      }
    };

    if (id) {
      fetchEventDetail();
    }
  }, [id]);

  const updateQty = (index, delta) => {
    setTickets((prev) =>
      prev.map((t, i) => {
        if (i !== index) return t;
        const newQty = Math.min(Math.max(t.qty + delta, 0), t.stock);
        return { ...t, qty: newQty };
      })
    );
  };

  const handleAddToCart = async () => {
    try {
      const cartItems = tickets
        .filter((ticket) => ticket.qty > 0)
        .map((ticket) => ({
          ticket_category_id: ticket.ticket_category_id,
          quantity: ticket.qty,
        }));

      if (cartItems.length === 0) {
        showNotification("Pilih setidaknya satu tiket", "Peringatan", "warning");
        return;
      }

      const results = await Promise.allSettled(cartItems.map((item) => api.post("/api/cart", item)));
      
      const successfulItems = results.filter(result => result.status === 'fulfilled' && 
        (result.value.status === 200 || result.value.status === 201));
      
      const failedItems = results.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && result.value.status !== 200 && result.value.status !== 201)
      );

      if (successfulItems.length > 0) {
        showNotification(
          `${successfulItems.length} tiket berhasil dimasukkan ke keranjang!`, 
          "Sukses", 
          "success"
        );
        setTickets((prev) => prev.map((t) => ({ ...t, qty: 0 })));
        
        if (failedItems.length === 0) {
          navigate("/keranjang");
        }
      }

      if (failedItems.length > 0) {
        const errorMessages = failedItems.map(item => {
          if (item.status === 'rejected') {
            return item.reason?.response?.data?.error || item.reason?.message || 'Error tidak diketahui';
          } else {
            return item.value?.data?.error || `Status: ${item.value.status}`;
          }
        });
        
        showNotification(
          `${failedItems.length} tiket gagal ditambahkan: ${errorMessages.join(', ')}`, 
          "Peringatan", 
          "warning"
        );
      }

    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.data?.error) {
        showNotification(`Gagal menambahkan tiket: ${error.response.data.error}`, "Error", "error");
      } else {
        showNotification("Gagal menambahkan tiket ke keranjang", "Error", "error");
      }
    }
  };

  const handleVerifyEvent = async (action) => {
    try {
      setVerifying(true);
      
      const statusData = {
        status: action === 'approve' ? 'approved' : 'rejected',
        approval_comment: approvalComment || `Event ${action === 'approve' ? 'disetujui' : 'ditolak'} oleh admin`
      };

      await eventAPI.verifyEvent(id, statusData);
      
      showNotification(
        `Event berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}!`, 
        "Sukses", 
        action === 'approve' ? 'success' : 'warning'
      );
      
      setShowVerificationModal(false);
      setApprovalComment("");
      
      const refreshedResponse = await api.get(`/api/event/${id}`);
      setEvent(refreshedResponse.data);
    } catch (error) {
      console.error("Error verifying event:", error);
      showNotification(
        `Gagal ${action === 'approve' ? 'menyetujui' : 'menolak'} event`, 
        "Error", 
        "error"
      );
    } finally {
      setVerifying(false);
    }
  };

  const openVerificationModal = (action) => {
    setVerificationAction(action);
    setShowVerificationModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      case 'pending':
        return 'Menunggu Verifikasi';
      default:
        return status;
    }
  };

  const canEdit = isOwner && (event?.status === 'pending' || event?.status === 'rejected');
  const canVerify = isAdmin && event?.status === 'pending';
  const canPurchase = isLoggedIn && !isOwner && !isAdmin && !isEO && event?.status === 'approved';
  const showTicketControls = canPurchase;
  const showStatusInfo = (isOwner || isAdmin) && isLoggedIn;

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center pt-36">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-lg">Memuat detail event...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex flex-col items-center justify-center pt-36">
          <div className="text-lg text-red-600 mb-4">
            {error || "Event tidak ditemukan"}
          </div>
          <button
            onClick={() => navigate("/cariEvent")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Kembali ke Cari Event
          </button>
        </div>
      </div>
    );
  }

  const totalHarga = tickets.reduce((sum, t) => sum + t.price * t.qty, 0);
  const adaTiketDipilih = tickets.some((t) => t.qty > 0);

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

      <div className="min-h-screen bg-[#E5E7EB] flex justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 bg-white shadow-xl p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
            </div>
            
            {canEdit && (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/edit-event/${id}`)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Edit Event
                </button>
              </div>
            )}
          </div>

          {showStatusInfo && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              event.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
              event.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
              event.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' :
              'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {getStatusIcon(event.status)}
              <div>
                <p className="font-semibold">
                  Status: {getStatusText(event.status)}
                </p>
                {event.approval_comment && (
                  <p className="text-sm mt-1">Komentar: {event.approval_comment}</p>
                )}
              </div>
            </div>
          )}

          {canVerify && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Verifikasi Event</h3>
              <p className="text-blue-700 mb-3">Sebagai admin, Anda dapat menyetujui atau menolak event ini.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => openVerificationModal('reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <XCircle size={18} />
                  Tolak Event
                </button>
                <button
                  onClick={() => openVerificationModal('approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Setujui Event
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-2 text-gray-700 text-sm mb-8">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-[#0C8CE9] shrink-0 mt-0.5" />
                  <span>{event.location}, {event.city}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[#0C8CE9]" />
                  <span>{formatDate(event.date_start, event.date_end)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-[#0C8CE9]" />
                  <span>{event.category}</span>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Tentang Event</h2>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {event.description}
                </p>
              </div>

              {!isOwner && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Pilihan Tiket</h2>

                  {tickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Belum ada tiket tersedia untuk event ini
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tickets.map((ticket, index) => (
                        <div
                          key={ticket.ticket_category_id}
                          className="border rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-all bg-white"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{ticket.type}</p>
                            <p className="text-sm text-gray-600 mt-1">{ticket.desc}</p>
                            <div className="flex flex-wrap gap-4 mt-2">
                              <p className="text-xs text-gray-500">
                                Stok: {ticket.stock} / {ticket.quota}
                              </p>
                              <p className="text-xs text-gray-500">
                                Terjual: {ticket.sold}
                              </p>
                              {ticket.date_time_start && (
                                <p className="text-xs text-gray-500">
                                  Berlaku: {formatDateTime(ticket.date_time_start)} - {formatDateTime(ticket.date_time_end)}
                                </p>
                              )}
                            </div>
                            {ticket.stock === 0 && (
                              <span className="text-xs text-red-500 font-semibold mt-1 inline-block">
                                HABIS
                              </span>
                            )}
                            <p className="text-lg text-red-900 font-bold mt-2">
                              {formatRupiah(ticket.price)}
                            </p>
                          </div>

                          {showTicketControls ? (
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQty(index, -1)}
                                  disabled={ticket.qty === 0}
                                  className={`w-8 h-8 flex items-center justify-center border rounded-full ${
                                    ticket.qty === 0
                                      ? "opacity-50 cursor-not-allowed bg-gray-100"
                                      : "hover:bg-gray-200 bg-white"
                                  }`}
                                >
                                  −
                                </button>
                                <span className="w-8 text-center font-semibold">{ticket.qty}</span>
                                <button
                                  onClick={() => updateQty(index, 1)}
                                  className={`w-8 h-8 flex items-center justify-center border rounded-full ${
                                    ticket.qty >= ticket.stock || ticket.stock === 0
                                      ? "opacity-50 cursor-not-allowed bg-gray-100"
                                      : "hover:bg-gray-200 bg-white"
                                  }`}
                                  disabled={
                                    ticket.qty >= ticket.stock || ticket.stock === 0
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              {!isLoggedIn && "Login untuk membeli tiket"}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isOwner && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Manajemen Tiket</h2>
                  {tickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border rounded-lg">
                      <p>Belum ada tiket yang dibuat untuk event ini</p>
                      <button 
                        onClick={() => navigate(`/edit-event/${id}`)}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Tambah Tiket
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket.ticket_category_id}
                          className="border rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-lg">{ticket.type}</p>
                              <p className="text-sm text-gray-600 mt-1">{ticket.desc}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                <div>
                                  <p className="text-xs text-gray-500">Harga</p>
                                  <p className="font-semibold">{formatRupiah(ticket.price)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Kuota</p>
                                  <p className="font-semibold">{ticket.quota}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Terjual</p>
                                  <p className="font-semibold text-green-600">{ticket.sold}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Sisa</p>
                                  <p className="font-semibold">{ticket.stock}</p>
                                </div>
                              </div>
                              {ticket.date_time_start && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Periode: {formatDateTime(ticket.date_time_start)} - {formatDateTime(ticket.date_time_end)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-5">
              <div className="rounded-lg overflow-hidden shadow-md aspect-square border">
                <img
                  src={
                    event.image ||
                    "https://cdn2.steamgriddb.com/icon_thumb/63872edc3fa52d645b3d48f6d98caf2c.png"
                  }
                  alt={event.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://cdn2.steamgriddb.com/icon_thumb/63872edc3fa52d645b3d48f6d98caf2c.png";
                  }}
                />
              </div>

              {event.flyer && (
                <div className="border rounded-lg p-4 shadow-sm bg-white">
                  <h3 className="text-base font-semibold mb-2">Banner Event</h3>
                  <img
                    src={event.flyer}
                    alt={`Flyer ${event.name}`}
                    className="w-full rounded-md border"
                  />
                </div>
              )}

              <div className="border rounded-lg p-4 shadow-sm bg-white">
                <p className="text-base font-semibold text-gray-700 mb-3">
                  Penyelenggara
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-gray-300 bg-gray-200 flex items-center justify-center">
                    {event.owner?.profile_pict ? (
                      <img
                        src={event.owner.profile_pict}
                        alt={event.owner.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-semibold text-xl"
                      style={{
                        display: event.owner?.profile_pict ? "none" : "flex",
                      }}
                    >
                      {event.owner?.name?.charAt(0)?.toUpperCase() || "O"}
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-800">
                      {event.owner?.name || "Organizer"}
                    </p>
                    {event.owner?.organization && (
                      <p className="text-sm text-gray-600">
                        {event.owner.organization}
                      </p>
                    )}
                    {event.owner?.email && (
                      <p className="text-xs text-gray-500 mt-1">
                        {event.owner.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {adaTiketDipilih && canPurchase && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-lg bg-[#F9FAFB] border shadow-md p-5 flex flex-col items-center sticky top-4"
                  >
                    <p className="text-xl font-bold text-gray-900 mb-3">
                      Total:{" "}
                      <span className="text-[#0C8CE9]">
                        {formatRupiah(totalHarga)}
                      </span>
                    </p>
                    <button
                      className="w-full bg-[#0C8CE9] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#0A6FC4] shadow transition-all text-lg"
                      onClick={handleAddToCart}
                    >
                      Masukkan ke Keranjang
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Tiket akan ditambahkan ke keranjang belanja Anda
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {isAdmin && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>View Admin:</strong> Anda melihat halaman ini sebagai administrator.
                  </p>
                  {event.status === 'pending' && (
                    <p className="text-sm text-blue-800 mt-1">
                      Gunakan tombol verifikasi di atas untuk menyetujui atau menolak event ini.
                    </p>
                  )}
                </div>
              )}

              {isLoggedIn && isOwner === false && isAdmin === false && isEO && (
                <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
                  <p className="text-sm text-purple-800">
                    <strong>View EO:</strong> Anda melihat event ini sebagai Event Organizer lain.
                  </p>
                  <p className="text-sm text-purple-800 mt-1">
                    Anda dapat melihat detail tiket tetapi tidak dapat membelinya.
                  </p>
                </div>
              )}

              {!isLoggedIn && (
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                  <p className="text-sm text-gray-800">
                    <strong>Anda belum login.</strong> Silakan login untuk dapat membeli tiket event ini.
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Login Sekarang
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-bold mb-4">
              {verificationAction === 'approve' ? 'Setujui Event' : 'Tolak Event'}
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Anda akan <strong>{verificationAction === 'approve' ? 'menyetujui' : 'menolak'}</strong> event:
              </p>
              <p className="font-semibold text-lg">{event.name}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Komentar Verifikasi {verificationAction === 'reject' ? '(Wajib untuk penolakan)' : '(Opsional)'}:
              </label>
              <textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                rows="3"
                placeholder={`Berikan komentar ${verificationAction === 'approve' ? 'persetujuan' : 'penolakan'}...`}
                required={verificationAction === 'reject'}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setApprovalComment("");
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                disabled={verifying}
              >
                Batal
              </button>
              <button 
                onClick={() => handleVerifyEvent(verificationAction === 'approve' ? 'approve' : 'reject')}
                className={`px-4 py-2 rounded-lg text-white ${
                  verificationAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={verifying || (verificationAction === 'reject' && !approvalComment.trim())}
              >
                {verifying ? "Memproses..." : verificationAction === 'approve' ? 'Setujui' : 'Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}