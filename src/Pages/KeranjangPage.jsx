import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { cartAPI, paymentAPI } from "../services/api";
import useNotification from "../hooks/useNotification";
import NotificationModal from "../components/NotificationModal";
import { Trash2, ExternalLink, Copy, Check, X } from "lucide-react";

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
      const response = await cartAPI.getCart();
      console.log("Backend response:", response.data);
      
      if (response.data && response.data.carts) {
        const transformedCart = transformCartData(response.data.carts);
        setCart(transformedCart);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Gagal memuat data keranjang");
      showNotification("Gagal memuat data keranjang", "Error", "error");
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
      
      if (!eventMap[eventId]) {
        eventMap[eventId] = {
          eventId: eventId,
          eventName: eventName,
          eventPoster: eventImage,
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
      // Auto refresh cart data setelah hapus
      showNotification(`Tiket "${itemToDelete.ticketName}" berhasil dihapus`, "Sukses", "success");
      window.location.reload();
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
      // Auto refresh cart data setelah hapus
      showNotification("Tiket berhasil dihapus dari keranjang", "Sukses", "success");
      window.location.reload();
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
      // Auto refresh cart data setelah update
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
      // Show modal konfirmasi untuk hapus
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
      // Auto refresh cart data setelah update
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
        
        // Tampilkan modal checkout success
        setShowCheckoutModal(true);
        
        // Auto refresh cart setelah checkout berhasil - tanpa timeout
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

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center pt-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat keranjang...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center pt-40">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={fetchCart}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Modal Konfirmasi Hapus Tiket */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
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
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Decrement ke 0 */}
      {showDecrementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
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
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDecrement}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Success Modal */}
      {showCheckoutModal && paymentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-green-600">Checkout Berhasil!</h2>
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold text-center">
                  Anda akan diarahkan ke halaman pembayaran...
                </p>
              </div>

              {/* Detail Transaksi */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Detail Transaksi</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID Transaksi:</span>
                    <span className="font-medium">{paymentData.transaction_id}</span>
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
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Link Pembayaran</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Jika tidak diarahkan otomatis, salin link berikut atau klik tombol di bawah:
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={paymentData.payment_url} 
                    readOnly 
                    className="flex-1 border rounded-lg px-3 py-2 text-xs bg-gray-50"
                  />
                  <button 
                    onClick={() => copyToClipboard(paymentData.payment_url)}
                    className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Tutup
                </button>
                <button 
                  onClick={openPaymentPage}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Buka Pembayaran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">
          <h1 className="text-2xl font-bold mb-6">Keranjang</h1>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Keranjang Anda kosong</p>
              <button 
                onClick={() => navigate('/cariEvent')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Jelajahi Event
              </button>
            </div>
          ) : (
            <>
              {cart.map((event) => (
                <div key={event.eventId} className="mb-10 border rounded-xl p-4 shadow-sm">
                  {/* Header Event */}
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={event.eventPoster}
                      className="w-20 h-20 rounded-lg object-cover"
                      alt={event.eventName}
                      onError={(e) => {
                        e.target.src = "https://picsum.photos/600/600?random=21";
                      }}
                    />
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold">{event.eventName}</h2>
                      <p className="text-sm text-gray-600">
                        {event.tickets[0]?.dateTimeStart ? 
                          new Date(event.tickets[0].dateTimeStart).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : ''
                        }
                      </p>
                    </div>
                  </div>

                  {/* Table-like Ticket Rows */}
                  <div className="grid grid-cols-12 font-semibold text-gray-700 border-b pb-2 mb-2">
                    <div className="col-span-5">Tiket</div>
                    <div className="col-span-3 text-center">Jumlah</div>
                    <div className="col-span-3 text-right">Subtotal</div>
                    <div className="col-span-1 text-center">Aksi</div>
                  </div>

                  {event.tickets.map((ticket) => (
                    <div
                      key={ticket.cartId}
                      className="grid grid-cols-12 py-3 border-b last:border-b-0 items-center"
                    >
                      {/* Info Tiket */}
                      <div className="col-span-5 pr-4">
                        <p className="font-semibold text-sm">{ticket.name}</p>
                        <p className="text-xs text-gray-600">{ticket.description}</p>
                        <p className="text-xs mt-1">Harga: {formatRupiah(ticket.price)}</p>
                        <p className="text-xs text-gray-500">Stok: {ticket.stock}</p>
                      </div>

                      {/* Increment Area */}
                      <div className="col-span-3 flex items-center justify-center gap-2">
                        <button
                          onClick={() => decrementQty(event.eventId, ticket.ticketId, ticket.cartId, ticket.qty, ticket.name)}
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-semibold">{ticket.qty}</span>
                        <button
                          onClick={() => incrementQty(event.eventId, ticket.ticketId, ticket.cartId, ticket.qty, ticket.stock)}
                          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="col-span-3 text-right pr-4 font-semibold">
                        {formatRupiah(ticket.price * ticket.qty)}
                      </div>

                      {/* Delete Button dengan Icon Trash */}
                      <div className="col-span-1 text-center">
                        <button
                          onClick={() => deleteCartItem(ticket.cartId, ticket.name)}
                          className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition flex items-center justify-center"
                          title="Hapus dari keranjang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Total & Checkout */}
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xl font-bold">Total: {formatRupiah(totalHarga)}</p>
                  
                  {/* Informasi Checkout */}
                  <div className="text-sm text-gray-600 text-right">
                    <p>Pembayaran aman via Midtrans</p>
                    <p>Buka di tab baru</p>
                  </div>
                </div>
                
                <button 
                  className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Memproses Pembayaran...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5" />
                      Checkout & Bayar
                    </>
                  )}
                </button>
                
                {/* Informasi tambahan */}
                <div className="mt-3 text-xs text-gray-500 text-center">
                  <p>Anda akan diarahkan ke halaman pembayaran Midtrans di tab baru</p>
                  <p className="mt-1">Setelah pembayaran selesai, Anda bisa menutup tab pembayaran dan kembali ke halaman ini</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}