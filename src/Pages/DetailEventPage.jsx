import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { MapPin, CalendarDays, Shapes, CheckCircle, XCircle, Clock, Scale, Building, FileText, ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";
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
                  {/* About Event - DIUBAH */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        Tentang Event
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                        {formatDescriptionWithNewlines(event.description)}
                      </div>
                    </div>
                  </div>

                  {/* Event Rules - DIUBAH */}
                  {event.rules && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-100">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                          <div className="bg-orange-600 p-2 rounded-lg">
                            <Scale className="w-6 h-6 text-white" />
                          </div>
                          Peraturan Event
                        </h2>
                      </div>
                      <div className="p-6">
                        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                          {formatDescriptionWithNewlines(event.rules)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ticket Section - DIUBAH */}
                  {!isOwner && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
                        <h2 className="text-2xl font-bold text-gray-900">Pilihan Tiket</h2>
                      </div>

                      {tickets.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                          <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                              <ShoppingCart className="w-10 h-10 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium mb-2">Belum ada tiket tersedia</p>
                            <p className="text-gray-400">Tiket untuk event ini belum tersedia</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 space-y-6">
                          {tickets.map((ticket, index) => (
                            <motion.div
                              key={ticket.ticket_category_id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                            >
                              <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <p className="font-bold text-xl text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                      {ticket.type}
                                    </p>
                                    {ticket.stock === 0 && (
                                      <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full font-semibold border border-red-200">
                                        HABIS
                                      </span>
                                    )}
                                    {ticket.stock > 0 && ticket.stock <= 10 && (
                                      <span className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full font-semibold border border-orange-200">
                                        HAMPIR HABIS
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="text-gray-600 mb-4 leading-relaxed bg-white/50 rounded-lg p-4 border border-gray-100">
                                    {formatDescriptionWithNewlines(ticket.desc)}
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                      <p className="font-medium text-blue-700">Stok Tersedia</p>
                                      <p className="font-bold text-gray-900 text-lg">{ticket.stock} / {ticket.quota}</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                      <p className="font-medium text-green-700">Terjual</p>
                                      <p className="font-bold text-green-600 text-lg">{ticket.sold}</p>
                                    </div>
                                    {ticket.date_time_start && (
                                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                                        <p className="font-medium text-purple-700">Periode Tiket</p>
                                        <p className="text-xs text-gray-600 font-medium">
                                          {formatDateTime(ticket.date_time_start)} - {formatDateTime(ticket.date_time_end)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <p className="text-2xl font-bold text-gray-900">
                                      {formatRupiah(ticket.price)}
                                    </p>
                                    {showTicketControls && (
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-300 p-1 shadow-sm">
                                          <button
                                            onClick={() => updateQty(index, -1)}
                                            disabled={ticket.qty === 0}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                                              ticket.qty === 0
                                                ? "opacity-30 cursor-not-allowed bg-gray-100 text-gray-400"
                                                : "hover:bg-red-50 hover:text-red-600 bg-white text-gray-700 hover:border-red-200"
                                            } border border-transparent`}
                                          >
                                            <Minus size={16} />
                                          </button>
                                          <span className="w-8 text-center font-bold text-lg text-gray-900">
                                            {ticket.qty}
                                          </span>
                                          <button
                                            onClick={() => updateQty(index, 1)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                                              ticket.qty >= ticket.stock || ticket.stock === 0
                                                ? "opacity-30 cursor-not-allowed bg-gray-100 text-gray-400"
                                                : "hover:bg-green-50 hover:text-green-600 bg-white text-gray-700 hover:border-green-200"
                                            } border border-transparent`}
                                            disabled={ticket.qty >= ticket.stock || ticket.stock === 0}
                                          >
                                            <Plus size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Owner Ticket Management - DIUBAH */}
                  {isOwner && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-purple-100">
                        <h2 className="text-2xl font-bold text-gray-900">Manajemen Tiket</h2>
                      </div>
                      {tickets.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                          <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                              <ShoppingCart className="w-10 h-10 text-purple-400" />
                            </div>
                            <p className="text-lg font-medium mb-4">Belum ada tiket yang dibuat</p>
                            <button 
                              onClick={() => navigate(`/edit-event/${id}`)}
                              className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                            >
                              Tambah Tiket
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 space-y-6">
                          {tickets.map((ticket) => (
                            <div
                              key={ticket.ticket_category_id}
                              className="bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-xl p-6 hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-4">
                                    <p className="font-bold text-xl text-gray-900">{ticket.type}</p>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                                      ticket.stock === 0 ? 'bg-red-100 text-red-800 border-red-200' : 
                                      'bg-green-100 text-green-800 border-green-200'
                                    }`}>
                                      {ticket.stock === 0 ? 'HABIS' : 'TERSEDIA'}
                                    </span>
                                  </div>
                                  
                                  <div className="text-gray-600 mb-6 leading-relaxed bg-white/50 rounded-lg p-4 border border-gray-100">
                                    {formatDescriptionWithNewlines(ticket.desc)}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                      <p className="text-sm text-blue-600 font-medium">Harga</p>
                                      <p className="font-bold text-lg text-gray-900">{formatRupiah(ticket.price)}</p>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                      <p className="text-sm text-purple-600 font-medium">Kuota</p>
                                      <p className="font-bold text-lg text-gray-900">{ticket.quota}</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                      <p className="text-sm text-green-600 font-medium">Terjual</p>
                                      <p className="font-bold text-lg text-green-600">{ticket.sold}</p>
                                    </div>
                                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                                      <p className="text-sm text-orange-600 font-medium">Sisa</p>
                                      <p className="font-bold text-lg text-gray-900">{ticket.stock}</p>
                                    </div>
                                  </div>
                                  
                                  {ticket.date_time_start && (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                      <p className="text-sm text-gray-600 font-medium mb-1">Periode Tiket:</p>
                                      <p className="text-sm text-gray-700 font-semibold">
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
                  {/* Event Images */}
                  <div className="grid grid-cols-1 gap-4">
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
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all duration-300 text-lg flex items-center justify-center gap-2"
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