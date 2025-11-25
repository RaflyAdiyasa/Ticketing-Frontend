// DetailEventPage.jsx
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { MapPin, CalendarDays, Shapes, CheckCircle, XCircle, Clock, Scale, Building, FileText, ArrowLeft, ShoppingCart } from "lucide-react";
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

  const formatDescriptionWithNewlines = (text) => {
    if (!text) return "";
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-40">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-lg text-gray-600">Memuat detail event...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center pt-40">
          <div className="text-lg text-red-600 mb-4">
            {error || "Event tidak ditemukan"}
          </div>
          <button
            onClick={() => navigate("/cariEvent")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
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

      <div className="min-h-screen bg-gray-100 pt-40 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header dengan Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Kembali
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold mb-4">{event.name}</h1>
                  
                  {/* Event Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-blue-100">Lokasi</p>
                        <p className="text-white font-semibold">{event.venue}, {event.district}</p>
                        <p className="text-xs text-blue-100">{event.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <CalendarDays className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-blue-100">Tanggal</p>
                        <p className="text-white font-semibold">{formatDate(event.date_start, event.date_end)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Shapes className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-blue-100">Kategori</p>
                        <p className="text-white font-semibold">{event.category} {event.child_category && `- ${event.child_category}`}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {canEdit && (
                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => navigate(`/edit-event/${id}`)}
                      className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                    >
                      Edit Event
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="p-8">
              {/* Status Info */}
              {showStatusInfo && (
                <div className={`mb-8 p-6 rounded-xl flex items-center gap-4 ${
                  event.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                  event.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                  event.status === 'approved' ? 'bg-green-50 border border-green-200' :
                  'bg-gray-50 border border-gray-200'
                }`}>
                  {getStatusIcon(event.status)}
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      Status: {getStatusText(event.status)}
                    </p>
                    {event.approval_comment && (
                      <p className="text-gray-600 mt-1">Komentar: {event.approval_comment}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Verification Section */}
              {canVerify && (
                <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">Verifikasi Event</h3>
                  <p className="text-blue-700 mb-4">Sebagai admin, Anda dapat menyetujui atau menolak event ini.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openVerificationModal('reject')}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <XCircle size={18} />
                      Tolak Event
                    </button>
                    <button
                      onClick={() => openVerificationModal('approve')}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <CheckCircle size={18} />
                      Setujui Event
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Event Images */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-xl overflow-hidden shadow-lg aspect-square border border-gray-200">
                      <img
                        src={event.image || "https://cdn2.steamgriddb.com/icon_thumb/63872edc3fa52d645b3d48f6d98caf2c.png"}
                        alt={event.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://cdn2.steamgriddb.com/icon_thumb/63872edc3fa52d645b3d48f6d98caf2c.png";
                        }}
                      />
                    </div>

                    {event.flyer && (
                      <div className="rounded-xl overflow-hidden shadow-lg aspect-video border border-gray-200">
                        <img
                          src={event.flyer}
                          alt={`Flyer ${event.name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* About Event */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      Tentang Event
                    </h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-white p-6 rounded-lg border">
                      {event.description}
                    </div>
                  </div>

                  {/* Event Rules */}
                  {event.rules && (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Scale className="w-6 h-6 text-blue-600" />
                        </div>
                        Peraturan Event
                      </h2>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-white p-6 rounded-lg border">
                        {event.rules}
                      </div>
                    </div>
                  )}

                  {/* Ticket Section */}
                  {!isOwner && (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Pilihan Tiket</h2>

                      {tickets.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-300">
                          <p className="text-lg font-medium mb-2">Belum ada tiket tersedia</p>
                          <p className="text-gray-400">Tiket untuk event ini belum tersedia</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {tickets.map((ticket, index) => (
                            <div
                              key={ticket.ticket_category_id}
                              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                            >
                              <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <p className="font-semibold text-xl text-gray-900">{ticket.type}</p>
                                    {ticket.stock === 0 && (
                                      <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full font-semibold">
                                        HABIS
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="text-gray-600 mb-4 whitespace-pre-line">
                                    {formatDescriptionWithNewlines(ticket.desc)}
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-4">
                                    <div>
                                      <p className="font-medium text-gray-700">Stok Tersedia</p>
                                      <p className="font-semibold text-gray-900">{ticket.stock} / {ticket.quota}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-700">Terjual</p>
                                      <p className="font-semibold text-green-600">{ticket.sold}</p>
                                    </div>
                                    {ticket.date_time_start && (
                                      <div>
                                        <p className="font-medium text-gray-700">Periode Tiket</p>
                                        <p className="text-xs text-gray-600">
                                          {formatDateTime(ticket.date_time_start)} - {formatDateTime(ticket.date_time_end)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <p className="text-2xl font-bold text-red-900">
                                    {formatRupiah(ticket.price)}
                                  </p>
                                </div>

                                {showTicketControls && (
                                  <div className="flex items-center gap-4 shrink-0">
                                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2 border">
                                      <button
                                        onClick={() => updateQty(index, -1)}
                                        disabled={ticket.qty === 0}
                                        className={`w-10 h-10 flex items-center justify-center border rounded-lg text-lg font-bold transition-colors ${
                                          ticket.qty === 0
                                            ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                                            : "hover:bg-gray-200 bg-white text-gray-700"
                                        }`}
                                      >
                                        −
                                      </button>
                                      <span className="w-12 text-center font-bold text-lg text-gray-900">{ticket.qty}</span>
                                      <button
                                        onClick={() => updateQty(index, 1)}
                                        className={`w-10 h-10 flex items-center justify-center border rounded-lg text-lg font-bold transition-colors ${
                                          ticket.qty >= ticket.stock || ticket.stock === 0
                                            ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                                            : "hover:bg-gray-200 bg-white text-gray-700"
                                        }`}
                                        disabled={ticket.qty >= ticket.stock || ticket.stock === 0}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Owner Ticket Management */}
                  {isOwner && (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Manajemen Tiket</h2>
                      {tickets.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-300">
                          <p className="text-lg font-medium mb-4">Belum ada tiket yang dibuat</p>
                          <button 
                            onClick={() => navigate(`/edit-event/${id}`)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Tambah Tiket
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {tickets.map((ticket) => (
                            <div
                              key={ticket.ticket_category_id}
                              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <p className="font-semibold text-xl text-gray-900">{ticket.type}</p>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                      ticket.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                      {ticket.stock === 0 ? 'HABIS' : 'TERSEDIA'}
                                    </span>
                                  </div>
                                  
                                  <div className="text-gray-600 mb-4 whitespace-pre-line">
                                    {formatDescriptionWithNewlines(ticket.desc)}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                                    <div>
                                      <p className="text-sm text-gray-500">Harga</p>
                                      <p className="font-semibold text-lg">{formatRupiah(ticket.price)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Kuota</p>
                                      <p className="font-semibold text-lg">{ticket.quota}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Terjual</p>
                                      <p className="font-semibold text-lg text-green-600">{ticket.sold}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Sisa</p>
                                      <p className="font-semibold text-lg">{ticket.stock}</p>
                                    </div>
                                  </div>
                                  
                                  {ticket.date_time_start && (
                                    <div className="bg-gray-50 rounded-lg p-4 border">
                                      <p className="text-sm text-gray-500 mb-1">Periode Tiket:</p>
                                      <p className="text-sm text-gray-700">
                                        {formatDateTime(ticket.date_time_start)} - {formatDateTime(ticket.date_time_end)}
                                      </p>
                                    </div>
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

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Organizer Info */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      Penyelenggara
                    </h3>
                    <div className="flex items-center gap-4">
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
                      <div className="flex-1">
                        <p className="text-lg font-medium text-gray-900">
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

                  {/* Cart Summary */}
                  <AnimatePresence>
                    {adaTiketDipilih && canPurchase && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-lg p-6 sticky top-4"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5 text-blue-600" />
                          Ringkasan Pembelian
                        </h3>
                        
                        <div className="space-y-3 mb-4">
                          {tickets.filter(t => t.qty > 0).map((ticket) => (
                            <div key={ticket.ticket_category_id} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">{ticket.type} × {ticket.qty}</span>
                              <span className="font-medium">{formatRupiah(ticket.price * ticket.qty)}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t border-blue-200 pt-4 mb-4">
                          <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span className="text-blue-700">{formatRupiah(totalHarga)}</span>
                          </div>
                        </div>
                        
                        <button
                          className="w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md transition-all text-lg flex items-center justify-center gap-2"
                          onClick={handleAddToCart}
                        >
                          <ShoppingCart size={20} />
                          Masukkan ke Keranjang
                        </button>
                        <p className="text-xs text-gray-500 mt-3 text-center">
                          Tiket akan ditambahkan ke keranjang belanja Anda
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* User Role Info Cards */}
                  {isAdmin && (
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                      <p className="text-sm text-blue-800 font-medium">
                        View Admin: Anda melihat halaman ini sebagai administrator.
                      </p>
                      {event.status === 'pending' && (
                        <p className="text-sm text-blue-800 mt-2">
                          Gunakan tombol verifikasi di atas untuk menyetujui atau menolak event ini.
                        </p>
                      )}
                    </div>
                  )}

                  {isLoggedIn && isOwner === false && isAdmin === false && isEO && (
                    <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
                      <p className="text-sm text-purple-800 font-medium">
                        View EO: Anda melihat event ini sebagai Event Organizer lain.
                      </p>
                      <p className="text-sm text-purple-800 mt-1">
                        Anda dapat melihat detail tiket tetapi tidak dapat membelinya.
                      </p>
                    </div>
                  )}

                  {!isLoggedIn && (
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                      <p className="text-sm text-gray-800 font-medium mb-3">
                        Anda belum login. Silakan login untuk dapat membeli tiket event ini.
                      </p>
                      <button
                        onClick={() => navigate("/login")}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Login Sekarang
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
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
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors font-medium"
                disabled={verifying}
              >
                Batal
              </button>
              <button 
                onClick={() => handleVerifyEvent(verificationAction === 'approve' ? 'approve' : 'reject')}
                className={`px-4 py-2 rounded-lg text-white transition-colors font-medium ${
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