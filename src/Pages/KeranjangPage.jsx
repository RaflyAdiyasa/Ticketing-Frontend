import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { cartAPI, paymentAPI } from "../services/api";
import useNotification from "../hooks/useNotification";
import NotificationModal from "../components/NotificationModal";
import { 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  Calendar, 
  MapPin, 
  Plus,
  Minus,
  AlertCircle,
  ShoppingCart,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function KeranjangPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { notification, showNotification, hideNotification } = useNotification();

  // State untuk modal checkout success
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [copied, setCopied] = useState(false);

  // State untuk modal konfirmasi hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDecrementModal, setShowDecrementModal] = useState(false);
  const [itemToDecrement, setItemToDecrement] = useState(null);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Fetch cart data from backend
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await cartAPI.getCart();
      console.log("Backend response:", response.data);
      
      if (response.data && response.data.carts) {
        const transformedCart = transformCartData(response.data.carts);
        setCart(transformedCart);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      const errorMessage = err.response?.data?.error || "Gagal memuat data keranjang";
      setError(errorMessage);
      showNotification(errorMessage, "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  // Transform backend response to frontend format
  const transformCartData = (backendCarts) => {
    const eventMap = {};
    
    backendCarts.forEach(cartItem => {
      console.log("Processing cart item:", cartItem);
      
      const eventId = cartItem.event?.event_id || cartItem.event_id;
      const eventName = cartItem.event?.name || "Unknown Event";
      const eventImage = cartItem.event?.image || "https://picsum.photos/600/600?random=21";
      const eventDate = cartItem.event?.date_start || cartItem.ticket_category?.date_time_start;
      const eventLocation = cartItem.event?.location || "Lokasi tidak tersedia";
      
      if (!eventMap[eventId]) {
        eventMap[eventId] = {
          eventId: eventId,
          eventName: eventName,
          eventPoster: eventImage,
          eventDate: eventDate,
          eventLocation: eventLocation,
          tickets: []
        };
      }
      
      if (cartItem.ticket_category) {
        eventMap[eventId].tickets.push({
          cartId: cartItem.cart_id,
          ticketId: cartItem.ticket_category.ticket_category_id,
          name: cartItem.ticket_category.name,
          description: cartItem.ticket_category.description,
          price: cartItem.ticket_category.price,
          qty: cartItem.quantity,
          stock: cartItem.ticket_category.quota - cartItem.ticket_category.sold,
          dateTimeStart: cartItem.ticket_category.date_time_start,
          dateTimeEnd: cartItem.ticket_category.date_time_end
        });
      }
    });
    
    return Object.values(eventMap);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Copy payment URL to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Open payment URL in new tab
  const openPaymentPage = () => {
    if (paymentData?.payment_url) {
      window.open(paymentData.payment_url, '_blank');
      setShowCheckoutModal(false);
    }
  };

  // === Modal handlers ===
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await cartAPI.deleteCart({ cart_id: itemToDelete.cartId });
      showNotification(`Tiket "${itemToDelete.ticketName}" berhasil dihapus`, "Sukses", "success");
      await fetchCart();
    } catch (err) {
      console.error("Error deleting cart item:", err);
      showNotification("Gagal menghapus tiket dari keranjang", "Error", "error");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const confirmDecrement = async () => {
    if (!itemToDecrement) return;
    
    try {
      await cartAPI.deleteCart({ cart_id: itemToDecrement.cartId });
      showNotification("Tiket berhasil dihapus dari keranjang", "Sukses", "success");
      await fetchCart();
    } catch (err) {
      console.error("Error deleting cart item:", err);
      showNotification("Gagal menghapus tiket dari keranjang", "Error", "error");
    } finally {
      setShowDecrementModal(false);
      setItemToDecrement(null);
    }
  };

  // === Increment handler ===
  const incrementQty = async (eventId, ticketId, cartId, currentQty, stock) => {
    if (currentQty >= stock) {
      showNotification("Stok tidak mencukupi", "Peringatan", "warning");
      return;
    }

    try {
      const updateData = {
        cart_id: cartId,
        quantity: currentQty + 1
      };

      await cartAPI.updateCart(updateData);
      await fetchCart();
      showNotification("Jumlah tiket berhasil ditambah", "Sukses", "success");
    } catch (err) {
      console.error("Error incrementing quantity:", err);
      const errorMessage = err.response?.data?.error || "Gagal menambah jumlah tiket";
      showNotification(errorMessage, "Error", "error");
    }
  };

  // === Decrement handler ===
  const decrementQty = async (eventId, ticketId, cartId, currentQty, ticketName) => {
    if (currentQty <= 1) {
      setItemToDecrement({
        cartId,
        ticketName
      });
      setShowDecrementModal(true);
      return;
    }

    try {
      const updateData = {
        cart_id: cartId,
        quantity: currentQty - 1
      };

      await cartAPI.updateCart(updateData);
      await fetchCart();
      showNotification("Jumlah tiket berhasil dikurangi", "Sukses", "success");
    } catch (err) {
      console.error("Error decrementing quantity:", err);
      const errorMessage = err.response?.data?.error || "Gagal mengurangi jumlah tiket";
      showNotification(errorMessage, "Error", "error");
    }
  };

  // === Delete specific cart item ===
  const deleteCartItem = async (cartId, ticketName) => {
    setItemToDelete({
      cartId,
      ticketName
    });
    setShowDeleteModal(true);
  };

  // === Checkout Handler - Tampilkan Modal ===
  const handleCheckout = async () => {
    if (cart.length === 0) {
      showNotification("Keranjang kosong, tidak dapat checkout", "Peringatan", "warning");
      return;
    }

    setCheckoutLoading(true);
    
    try {
      const response = await paymentAPI.createPayment();
      
      if (response.data) {
        setPaymentData(response.data);
        
        // Simpan transaction info untuk referensi
        sessionStorage.setItem('last_transaction_id', response.data.transaction_id);
        sessionStorage.setItem('last_transaction_total', response.data.total);
        
        setShowCheckoutModal(true);
        await fetchCart();
        
      } else {
        throw new Error("Data pembayaran tidak tersedia");
      }
      
    } catch (err) {
      console.error("Error during checkout:", err);
      const errorMessage = err.response?.data?.error || "Gagal memproses checkout";
      showNotification(errorMessage, "Checkout Gagal", "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Total harga keseluruhan
  const totalHarga = cart.reduce((sum, event) => {
    return sum + event.tickets.reduce((s, t) => s + t.price * t.qty, 0);
  }, 0);

  // Format date untuk display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Stats untuk keranjang
  const cartStats = {
    totalItems: cart.reduce((sum, event) => sum + event.tickets.length, 0),
    totalEvents: cart.length,
    totalQuantity: cart.reduce((sum, event) => 
      sum + event.tickets.reduce((s, t) => s + t.qty, 0), 0
    )
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] pt-24">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"
            />
            <p className="mt-6 text-slate-600 font-medium">Memuat keranjang...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] pt-24 p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-red-100"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Terjadi Kesalahan</h3>
            <p className="text-slate-600 mb-8">{error}</p>
            <motion.button
              onClick={fetchCart}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw size={18} className="inline mr-2" />
              Coba Lagi
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      {/* Modal Konfirmasi Hapus Tiket */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 border border-gray-100 shadow-2xl"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Hapus Tiket
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Hapus tiket "{itemToDelete?.ticketName}" dari keranjang?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setItemToDelete(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Decrement ke 0 */}
      <AnimatePresence>
        {showDecrementModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 border border-gray-100 shadow-2xl"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                  <X className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Hapus Tiket
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Jumlah tiket akan menjadi 0. Hapus tiket "{itemToDecrement?.ticketName}" dari keranjang?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDecrementModal(false);
                      setItemToDecrement(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmDecrement}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Success Modal */}
      <AnimatePresence>
        {showCheckoutModal && paymentData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-100 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-green-600 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Checkout Berhasil!
                </h2>
                <motion.button 
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold text-center">
                    Anda akan diarahkan ke halaman pembayaran...
                  </p>
                </div>

                {/* Detail Transaksi */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3 text-gray-900">Detail Transaksi</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Transaksi:</span>
                      <span className="font-medium text-gray-900">{paymentData.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Pembayaran:</span>
                      <span className="font-bold text-blue-600">{formatRupiah(paymentData.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-yellow-600">Menunggu Pembayaran</span>
                    </div>
                  </div>
                </div>

                {/* Payment URL */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-2 text-gray-900">Link Pembayaran</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Jika tidak diarahkan otomatis, salin link berikut atau klik tombol di bawah:
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={paymentData.payment_url} 
                      readOnly 
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white"
                    />
                    <motion.button 
                      onClick={() => copyToClipboard(paymentData.payment_url)}
                      className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                    </motion.button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <motion.button 
                    onClick={() => setShowCheckoutModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Tutup
                  </motion.button>
                  <motion.button 
                    onClick={openPaymentPage}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Buka Pembayaran
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mt-15"
          >
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  Keranjang Belanja
                </h1>
                <p className="text-gray-600 mt-2">
                  Kelola tiket event yang akan Anda beli
                </p>
              </div>
              
              <motion.button
                onClick={fetchCart}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </motion.button>
            </motion.div>

            {/* Stats Card */}
            {cart.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-blue-600 text-white p-6 rounded-xl mb-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Ringkasan Keranjang</p>
                    <p className="text-3xl font-bold mt-1">{cartStats.totalQuantity} Tiket</p>
                    <p className="text-blue-100 text-sm mt-2">
                      {cartStats.totalEvents} event • {cartStats.totalItems} jenis tiket
                    </p>
                  </div>
                  <motion.div 
                    className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <ShoppingCart size={32} className="text-blue-600"/>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {cart.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Keranjang Kosong</h3>
                <p className="text-slate-600 mb-8">Belum ada tiket di keranjang belanja Anda</p>
                <motion.button
                  onClick={() => navigate('/cariEvent')}
                  className="px-6 py-4 bg-blue-600 text-white rounded-xl font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles size={18} className="inline mr-2" />
                  Jelajahi Event
                </motion.button>
              </motion.div>
            ) : (
              <>
                {/* Daftar Event dalam Keranjang */}
                <div className="space-y-6">
                  {cart.map((event, index) => (
                    <motion.div 
                      key={event.eventId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      
                      {/* Header Event */}
                      <div className="p-6 md:p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-shrink-0">
                            <img 
                              src={event.eventPoster} 
                              alt={event.eventName}
                              className="w-20 h-20 rounded-xl object-cover shadow-md border border-gray-200"
                              onError={(e) => {
                                e.target.src = "https://picsum.photos/600/600?random=21";
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{event.eventName}</h2>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar size={16} className="text-blue-600 flex-shrink-0" />
                                <span className="text-sm">{formatDate(event.eventDate)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin size={16} className="text-blue-600 flex-shrink-0" />
                                <span className="text-sm">{event.eventLocation}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Daftar Tiket */}
                      <div className="border-t border-gray-200">
                        <div className="p-6 md:p-8 space-y-4">
                          {event.tickets.map((ticket, ticketIndex) => (
                            <motion.div 
                              key={ticket.cartId} 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (index + ticketIndex) * 0.05 }}
                              className="bg-gray-50 rounded-xl border border-gray-300 p-4 hover:border-blue-300 transition-colors"
                            >
                              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{ticket.name}</h3>
                                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {ticket.description}
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-900">{formatRupiah(ticket.price)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">Stok tersedia:</span>
                                      <span className="font-semibold text-gray-900">{ticket.stock}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-300 p-2 shadow-sm">
                                    <motion.button
                                      onClick={() => decrementQty(event.eventId, ticket.ticketId, ticket.cartId, ticket.qty, ticket.name)}
                                      className="p-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Minus size={16} className="text-gray-700" />
                                    </motion.button>
                                    <span className="w-8 text-center font-bold text-lg text-gray-900">{ticket.qty}</span>
                                    <motion.button
                                      onClick={() => incrementQty(event.eventId, ticket.ticketId, ticket.cartId, ticket.qty, ticket.stock)}
                                      className="p-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Plus size={16} className="text-gray-700" />
                                    </motion.button>
                                  </div>
                                  
                                  {/* Delete Button */}
                                  <motion.button
                                    onClick={() => deleteCartItem(ticket.cartId, ticket.name)}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                                    title="Hapus dari keranjang"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Trash2 size={18} />
                                  </motion.button>
                                </div>
                              </div>
                              
                              {/* Subtotal */}
                              <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                                <span className="text-gray-600 text-sm">Subtotal:</span>
                                <span className="font-bold text-gray-900 text-lg">
                                  {formatRupiah(ticket.price * ticket.qty)}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Total & Checkout */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 pt-8 border-t border-gray-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-lg">Total Pembayaran:</span>
                          <span className="font-bold text-2xl">
                            {formatRupiah(totalHarga)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Informasi Checkout */}
                      <div className="mt-4 text-sm text-gray-600 space-y-1">
                        <p className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Pembayaran akan dilakukan secara aman melalui Midtrans
                        </p>
                        <p className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Anda akan dibawa ke tab baru untuk pembayaran
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          Setelah pembayaran selesai, Anda bisa menutup tab pembayaran dan kembali ke halaman ini
                        </p>
                      </div>
                    </div>
                    
                    <div className="lg:w-64">
                      <motion.button 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {checkoutLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <ExternalLink size={20} />
                            Checkout & Bayar
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}