import { useParams } from "react-router";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { MapPin, CalendarDays, Grid3X3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EventDetail() {
  const { id } = useParams();

  // Format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const dummy = {
      id,
      name: "Arima Kinen",
      location:
        "Jalan Intan Raya Blok I no.5, Pondok Timur Indah, Mustika Jaya, Kota Bekasi, Jawa Barat",
      date: "29 Nov 2025 - 30 Nov 2025",
      category: "Olahraga",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
      image:
        "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?q=80&w=800",
      organizer: {
        name: "Seseorang yang sangat tampan",
        photo:
          "https://cdn2.steamgriddb.com/icon_thumb/4cf54a3d780b9294815e5f249164f20f.png",
      },
      tickets: [
        { type: "Dewasa", desc: "Untuk usia 20 ke atas", price: 120000, stock: 5 },
        { type: "Remaja", desc: "Untuk usia 13 - 19 tahun", price: 100000, stock: 3 },
        { type: "Anak", desc: "Untuk usia 12 ke bawah", price: 90000, stock: 10 },
      ],
    };

    setEvent(dummy);
    setTickets(dummy.tickets.map((t) => ({ ...t, qty: 0 }))); // Awal 0
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

  if (!event) return <div>Loading...</div>;

  const totalHarga = tickets.reduce(
    (sum, t) => sum + t.price * t.qty,
    0
  );
  const adaTiketDipilih = tickets.some((t) => t.qty > 0);

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 bg-white shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* === BAGIAN KIRI === */}
            <div className=" lg:col-span-2">
              {/* Judul dan info */}
              <h1 className="text-3xl font-bold mb-4">{event.name}</h1>

              <div className="space-y-2 text-gray-700 text-sm">
                <p className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-[#0C8CE9] shrink-0" />
                  {event.location}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[#0C8CE9]" />
                  {event.date}
                </p>
                <p className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-[#0C8CE9]" />
                  {event.category}
                </p>
              </div>

              {/* Tentang Event */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Tentang Event</h2>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {event.description}
                </p>
              </div>

              {/* Pilihan Tiket */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Pilihan Tiket</h2>

                <div className="space-y-4">
                  {tickets.map((ticket, index) => (
                    <div
                      key={index}
                      className="border rounded-md p-3 flex justify-between items-center hover:shadow-md transition-all"
                    >
                      <div>
                        <p className="font-semibold">{ticket.type}</p>
                        <p className="text-xs text-gray-600">
                          Keterangan: {ticket.desc}
                        </p>
                        <p className="text-xs text-gray-500">
                          Stok: {ticket.stock}
                        </p>
                        <p className="text-sm text-red-900 font-semibold mt-1">
                          {formatRupiah(ticket.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(index, -1)}
                          className="px-2 py-1 border rounded hover:bg-gray-200"
                        >
                          −
                        </button>
                        <span className="w-5 text-center">{ticket.qty}</span>
                        <button
                          onClick={() => updateQty(index, 1)}
                          className={`px-2 py-1 border rounded ${
                            ticket.qty >= ticket.stock
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-200"
                          }`}
                          disabled={ticket.qty >= ticket.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* === BAGIAN KANAN === */}
            <div className="lg:col-span-1 space-y-5">
              {/* Gambar utama ratio 1:1 */}
              <div className="rounded-md overflow-hidden shadow-md aspect-square">
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Penyelenggara */}
              <div className="border rounded-md p-4 shadow-sm flex flex-col">
                <p className="text-base font-semibold text-gray-700 mb-3">
                  Penyelenggara
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-16 aspect-square rounded-full overflow-hidden shrink-0 border">
                    <img
                      src={event.organizer.photo}
                      alt={event.organizer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-base font-medium text-gray-800 truncate">
                    {event.organizer.name}
                  </p>
                </div>
              </div>

              {/* Total Harga & Tombol di bawah penyelenggara */}
              <AnimatePresence>
                {adaTiketDipilih && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-lg bg-[#F9FAFB] border shadow-md p-5 flex flex-col items-center"
                  >
                    <p className="text-xl font-bold text-gray-900 mb-3">
                      Total:{" "}
                      <span className="text-[#0C8CE9]">
                        {formatRupiah(totalHarga)}
                      </span>
                    </p>
                    <button
                      className="bg-[#0C8CE9] text-white font-medium px-6 py-2 rounded-lg hover:bg-[#0A6FC4] shadow transition-all"
                      onClick={() => alert("Tiket dimasukkan ke keranjang!")}
                    >
                      Masukkan ke Keranjang
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
