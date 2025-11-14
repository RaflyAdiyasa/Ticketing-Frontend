import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";

export default function LandingPage() {
  const navigate = useNavigate();

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Semua data event
  const [events] = useState([
    {
      id: 1,
      name: "Jakarta Music Festival yang iya-iyalah",
      date: "29 Nov 2025 - 30 Nov 2025",
      price: 100000,
      poster: "https://picsum.photos/800/800?random=11",
      banner:
        "https://gametora.com/images/umamusume/en/gacha/img_bnr_gacha_30040.png",
    },
    {
      id: 2,
      name: "Tech Expo Indonesia",
      date: "15 Des 2025 - 17 Des 2025",
      price: 150000,
      poster: "https://picsum.photos/800/800?random=22",
      banner:
        "https://cdn2.steamgriddb.com/hero_thumb/beac6d8fdd97a5e184ace84f9988a0fc.jpg",
    },
    {
      id: 3,
      name: "Marathon Surabaya 2025",
      date: "10 Jan 2026",
      price: 200000,
      poster: "https://picsum.photos/800/800?random=33",
      banner:
        "https://cdn2.steamgriddb.com/hero_thumb/6c528267ba256819c1607cddbd7b650b.jpg",
    },
    {
      id: 4,
      name: "Art Exhibition Jogja",
      date: "22 Feb 2026 - 25 Feb 2026",
      price: 120000,
      poster: "https://cdn2.steamgriddb.com/icon_thumb/4cf54a3d780b9294815e5f249164f20f.png",
      banner:
        "https://cdn2.steamgriddb.com/hero_thumb/64118b7020f3dc8d26b09149d29050cf.jpg",
    },
    
  ]);

  // Ambil max 5 banner
  const bannerList = events.slice(0, 5).map((e) => e.banner);

  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerList.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [bannerList.length]);

  const handleCardClick = (id) => navigate(`/detailevent/${id}`);

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">

          {/* Banner Slider (exact ratio & stable) */}
          <div className="w-full aspect-16/6 rounded-xl mb-10 overflow-hidden relative shadow-lg">
            <img
              src={bannerList[currentBanner]}
              className="w-full h-full object-cover transition-all duration-700"
            />

            {/* dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {bannerList.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentBanner ? "bg-white" : "bg-white/50"
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* Title & Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Event Populer</h2>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => navigate("/carievent")}
            >
              Lihat Semua
            </button>
          </div>

          {/* === EVENT CARDS (exact same style as cari event) === */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-30">
            {events.slice(0, 5).map((event) => (
              <div
                key={event.id}
                onClick={() => handleCardClick(event.id)}
                className="bg-white border rounded-md shadow-sm overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                {/* Poster 1:1 */}
                <div className="relative w-full pb-[100%] bg-gray-300">
                  <img
                    src={event.poster}
                    alt={event.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>

                {/* Detail */}
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
  );
}


