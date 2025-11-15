import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { cartAPI } from "../services/api";

export default function KeranjangPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      console.log("Backend response:", response.data); // Debug log
      
      if (response.data && response.data.carts) {
        // Transform backend data to frontend format
        const transformedCart = transformCartData(response.data.carts);
        setCart(transformedCart);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Gagal memuat data keranjang");
    } finally {
      setLoading(false);
    }
  };

  // Transform backend response to frontend format
  const transformCartData = (backendCarts) => {
    const eventMap = {};
    
    backendCarts.forEach(cartItem => {
      console.log("Processing cart item:", cartItem); // Debug log
      
      // Gunakan field names dengan underscore sesuai response backend
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
      
      // Pastikan ticket_category ada
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

  // === Increment handler ===
  const incrementQty = async (eventId, ticketId, cartId, currentQty, stock) => {
    if (currentQty >= stock) {
      alert("Stok tidak mencukupi");
      return;
    }

    try {
      const updateData = {
        cart_id: cartId,
        quantity: currentQty + 1
      };

      await cartAPI.updateCart(updateData);
      // Refresh cart data after successful update
      await fetchCart();
    } catch (err) {
      console.error("Error incrementing quantity:", err);
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("Gagal menambah jumlah tiket");
      }
    }
  };

  // === Decrement handler ===
  const decrementQty = async (eventId, ticketId, cartId, currentQty) => {
    if (currentQty <= 1) {
      const confirmDelete = window.confirm(
        `Jumlah tiket akan menjadi 0.\nHapus tiket ini dari keranjang?`
      );
      
      if (confirmDelete) {
        try {
          await cartAPI.deleteCart({ cart_id: cartId });
          // Refresh cart data after successful deletion
          await fetchCart();
        } catch (err) {
          console.error("Error deleting cart item:", err);
          alert("Gagal menghapus tiket dari keranjang");
        }
      }
      return;
    }

    try {
      const updateData = {
        cart_id: cartId,
        quantity: currentQty - 1
      };

      await cartAPI.updateCart(updateData);
      // Refresh cart data after successful update
      await fetchCart();
    } catch (err) {
      console.error("Error decrementing quantity:", err);
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("Gagal mengurangi jumlah tiket");
      }
    }
  };

  // === Delete specific cart item ===
  const deleteCartItem = async (cartId, ticketName) => {
    const confirmDelete = window.confirm(
      `Hapus tiket "${ticketName}" dari keranjang?`
    );
    
    if (confirmDelete) {
      try {
        await cartAPI.deleteCart({ cart_id: cartId });
        // Refresh cart data after successful deletion
        await fetchCart();
      } catch (err) {
        console.error("Error deleting cart item:", err);
        alert("Gagal menghapus tiket dari keranjang");
      }
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

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">
          <h1 className="text-2xl font-bold mb-6">Keranjang</h1>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Keranjang Anda kosong</p>
              <button 
                onClick={() => navigate('/events')}
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
                          onClick={() => decrementQty(event.eventId, ticket.ticketId, ticket.cartId, ticket.qty)}
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

                      {/* Delete Button */}
                      <div className="col-span-1 text-center">
                        <button
                          onClick={() => deleteCartItem(ticket.cartId, ticket.name)}
                          className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-sm"
                          title="Hapus dari keranjang"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Total & Checkout */}
              <div className="border-t pt-4 mt-6">
                <p className="text-xl font-bold mb-4">Total: {formatRupiah(totalHarga)}</p>
                <button 
                  className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
                  onClick={() => navigate('/checkout')}
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}