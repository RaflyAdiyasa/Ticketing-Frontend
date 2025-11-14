import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";

export default function CariEvent() {
  const navigate = useNavigate();
   // const [ namaEvent] = useParams();

  // Fungsi helper: ubah angka ke format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const [events, setEvents] = useState([
    {
      id: 1,
      name: "Jakarta Music Festival yang iya-iyalah",
      date: "29 Nov 2025 - 30 Nov 2025",
      price: 100000,
      image:
        "https://cdn2.steamgriddb.com/icon_thumb/63872edc3fa52d645b3d48f6d98caf2c.png",
    },
    {
      id: 2,
      name: "Tech Expo Indonesia",
      date: "15 Des 2025 - 17 Des 2025",
      price: 150000,
      image:
        "https://cdn2.steamgriddb.com/thumb/150baffb015150eb28e684c68469e438.jpg",
    },
    {
      id: 3,
      name: "Marathon Surabaya 2025",
      date: "10 Jan 2026",
      price: 200000,
      image:
        "https://pbs.twimg.com/media/F8Fb3tPXgAA2Xs8?format=jpg&name=large",
    },
    {
      id: 4,
      name: "Art Exhibition Jogja",
      date: "22 Feb 2026 - 25 Feb 2026",
      price: 120000,
      image:
        "https://cdn2.steamgriddb.com/icon_thumb/4cf54a3d780b9294815e5f249164f20f.png",
    },
    {
      id: 5,
      name: "Art Exhibition Jogja",
      date: "22 Feb 2026 - 25 Feb 2026",
      price: 120000,
      image:
        "https://cdn2.steamgriddb.com/icon_thumb/4cf54a3d780b9294815e5f249164f20f.png",
    },
    {
      id: 6,
      name: "Art Exhibition Jogja",
      date: "22 Feb 2026 - 25 Feb 2026",
      price: 120000,
      image:
        "https://cdn2.steamgriddb.com/icon_thumb/4cf54a3d780b9294815e5f249164f20f.png",
    },
    {
      id: 7,
      name: "Art Exhibition Jogja",
      date: "22 Feb 2026 - 25 Feb 2026",
      price: 120000,
      image:
        "https://cdn2.steamgriddb.com/icon_thumb/4cf54a3d780b9294815e5f249164f20f.png",
    },
    {
      id: 8,
      name: "Art Exhibition Jogja",
      date: "22 Feb 2026 - 25 Feb 2026",
      price: 120000,
      image:
        "https://cdn2.steamgriddb.com/icon_thumb/4cf54a3d780b9294815e5f249164f20f.png",
    },
    {
      id: 9,
      name: "Art Exhibition Jogja",
      date: "22 Feb 2026 - 25 Feb 2026",
      price: 120000,
      image:
        "https://cdn2.steamgriddb.com/icon_thumb/4cf54a3d780b9294815e5f249164f20f.png",
    },
  ]);

  // Jika ingin load dari backend (contoh)
  useEffect(() => {
    // fetch("https://your-backend-api.com/events")
    //   .then(res => res.json())
    //   .then(data => setEvents(data))
    //   .catch(err => console.error("Error fetching events:", err));
  }, []);

  // Fungsi klik kartu event
  const handleCardClick = (id) => {
    navigate(`/detailEvent/${id}`);
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-5">
            
            {/* === FILTER PANEL === */}
            <div className="col-span-2 p-4 bg-white border rounded-md shadow-sm self-start">
              <h3 className="font-semibold mb-4">Filter Pencarianmu</h3>

              <div className="flex flex-col space-y-3 text-sm">
                <div>
                  <label className="block mb-1">Kata kunci :</label>
                  <input
                    type="text"
                    
                    placeholder="Event 1"
                    className="w-full border border-gray-400 rounded px-2 py-1"
                  />
                </div>

                <div>
                  <label className="block mb-1">Tanggal :</label>
                  <input
                    type="date"
                    className="w-full border border-gray-400 rounded px-2 py-1"
                  />
                </div>

                <div>
                  <label className="block mb-1">Kategori :</label>
                  <select className="w-full border border-gray-400 rounded px-2 py-1">
                    <option>Semua Kategori</option>
                    <option>Musik</option>
                    <option>Olahraga</option>
                    <option>Pameran</option>
                    <option>Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Lokasi :</label>
                  <select className="w-full border border-gray-400 rounded px-2 py-1">
                    <option>Kota Jakarta</option>
                    <option>Bandung</option>
                    <option>Surabaya</option>
                    <option>Yogyakarta</option>
                  </select>
                </div>

                <button className="bg-gray-700 text-white py-1.5 rounded hover:bg-gray-800">
                  FILTER
                </button>
              </div>
            </div>

            {/* === EVENT GRID === */}
            <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-6 rounded-md">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-30">
                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleCardClick(event.id)}
                    className="bg-white border rounded-md shadow-sm overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  >
                    {/* Kontainer gambar persegi (rasio 1:1) */}
                    <div className="relative w-full pb-[100%] bg-gray-300">
                      <img
                        src={event.image}
                        alt={event.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    </div>

                    {/* Informasi event */}
                    <div className="p-2 text-sm">
                      <p className="font-semibold text-base truncate whitespace-nowrap overflow-hidden">
                        {event.name}
                      </p>
                      <p className="text-xs text-gray-700">{event.date}</p>
                      <p className="text-xs text-gray-700 mt-3">Mulai dari</p>
                      <p className="text-base text-red-900 font-semibold">
                        {formatRupiah(event.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
