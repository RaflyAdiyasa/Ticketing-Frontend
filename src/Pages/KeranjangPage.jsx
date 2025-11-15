// KeranjangPage.jsx (with increment, decrement, stock validation, auto-cleanup + delete confirmation)
import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";

export default function KeranjangPage() {
  const navigate = useNavigate();

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const [cart, setCart] = useState([
    {
      eventId: 101,
      eventName: "Jakarta Music Festival",
      eventPoster: "https://picsum.photos/600/600?random=21",
      tickets: [
        {
          ticketId: 1,
          name: "Regular A",
          description: "Akses festival 1 hari",
          price: 150000,
          qty: 1,
          stock: 10,
        },
        {
          ticketId: 2,
          name: "VIP Pass",
          description: "Akses semua area + backstage",
          price: 450000,
          qty: 2,
          stock: 5,
        },
      ],
    },
    {
      eventId: 102,
      eventName: "Tech Expo Indonesia",
      eventPoster: "https://picsum.photos/600/600?random=22",
      tickets: [
        {
          ticketId: 3,
          name: "Daily Pass",
          description: "Akses 1 hari penuh",
          price: 120000,
          qty: 1,
          stock: 20,
        },
      ],
    },
  ]);

  // === Increment handler ===
  const incrementQty = (eventId, ticketId) => {
    setCart((prev) =>
      prev
        .map((event) => {
          if (event.eventId !== eventId) return event;

          const updatedTickets = event.tickets.map((t) => {
            if (t.ticketId !== ticketId) return t;
            if (t.qty >= t.stock) return t; // prevent exceeding stock
            return { ...t, qty: t.qty + 1 };
          });

          return { ...event, tickets: updatedTickets };
        })
        .filter((event) => event.tickets.length > 0)
    );
  };

  // === Decrement handler (WITH CONFIRMATION) ===
  const decrementQty = (eventId, ticketId) => {
    setCart((prev) =>
      prev
        .map((event) => {
          if (event.eventId !== eventId) return event;

          const updatedTickets = event.tickets
            .map((t) => {
              if (t.ticketId !== ticketId) return t;

              // If qty will become 0 → ask confirmation
              if (t.qty <= 1) {
                const confirmDelete = window.confirm(
                  `Jumlah tiket "${t.name}" akan menjadi 0.\nHapus tiket ini dari keranjang?`
                );
                if (!confirmDelete) return t; // cancel deletion
                return null; // remove ticket
              }

              return { ...t, qty: t.qty - 1 };
            })
            .filter(Boolean);

          return { ...event, tickets: updatedTickets };
        })
        .filter((event) => event.tickets.length > 0)
    );
  };

  // Total harga keseluruhan
  const totalHarga = cart.reduce((sum, event) => {
    return sum + event.tickets.reduce((s, t) => s + t.price * t.qty, 0);
  }, 0);

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">
          <h1 className="text-2xl font-bold mb-6">Keranjang</h1>

          {cart.map((event) => (
            <div key={event.eventId} className="mb-10 border rounded-xl p-4 shadow-sm">
              {/* Header Event */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={event.eventPoster}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <h2 className="text-lg font-semibold">{event.eventName}</h2>
              </div>

              {/* Table-like Ticket Rows */}
              <div className="grid grid-cols-12 font-semibold text-gray-700 border-b pb-2 mb-2">
                <div className="col-span-5">Tiket</div>
                <div className="col-span-3 text-center">Jumlah</div>
                <div className="col-span-4 text-right">Subtotal</div>
              </div>

              {event.tickets.map((ticket) => (
                <div
                  key={ticket.ticketId}
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
                      onClick={() => decrementQty(event.eventId, ticket.ticketId)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{ticket.qty}</span>
                    <button
                      onClick={() => incrementQty(event.eventId, ticket.ticketId)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="col-span-4 text-right pr-2 font-semibold">
                    {formatRupiah(ticket.price * ticket.qty)}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Total & Checkout */}
          <div className="border-t pt-4 mt-6">
            <p className="text-xl font-bold mb-4">Total: {formatRupiah(totalHarga)}</p>
            <button className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
