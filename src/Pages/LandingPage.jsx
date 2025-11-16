import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

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
      banner: "https://gametora.com/images/umamusume/en/gacha/img_bnr_gacha_30040.png",
    },
    {
      id: 2,
      name: "Tech Expo Indonesia",
      date: "15 Des 2025 - 17 Des 2025",
      price: 150000,
      poster: "https://picsum.photos/800/800?random=22",
      banner: "https://cdn2.steamgriddb.com/hero_thumb/beac6d8fdd97a5e184ace84f9988a0fc.jpg",
    },
    {
      id: 3,
      name: "Marathon Surabaya 2025",
      date: "10 Jan 2026",
      price: 200000,
      poster: "https://picsum.photos/800/800?random=33",
      banner: "https://cdn2.steamgriddb.com/hero_thumb/6c528267ba256819c1607cddbd7b650b.jpg",
    },
    {
      id: 4,
      name: "Art Exhibition Jogja",
      date: "22 Feb 2026 - 25 Feb 2026",
      price: 120000,
      poster: "https://cdn2.steamgriddb.com/icon_thumb/4cf54a3d780b9294815e5f249164f20f.png",
      banner: "https://cdn2.steamgriddb.com/hero_thumb/64118b7020f3dc8d26b09149d29050cf.jpg",
    },
  ]);

  const bannerEvents = events.slice(0, 5);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto slide - hanya jika tidak sedang drag atau animasi
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isDragging && !isAnimating) {
        handleNext();
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [currentBanner, isDragging, isAnimating]);

  const handleNext = useCallback(() => {
    setIsAnimating(true);
    setCurrentBanner((prev) => (prev + 1) % bannerEvents.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [bannerEvents.length]);

  const handlePrev = useCallback(() => {
    setIsAnimating(true);
    setCurrentBanner((prev) => (prev - 1 + bannerEvents.length) % bannerEvents.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [bannerEvents.length]);

  // Mouse drag handlers
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event, info) => {
    setDragX(info.offset.x);
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const threshold = 100;
    
    if (info.offset.x < -threshold) {
      handleNext(); // Drag ke kiri
    } else if (info.offset.x > threshold) {
      handlePrev(); // Drag ke kanan
    } else {
      // Jika drag tidak mencapai threshold, kembali ke posisi semula dengan animasi
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
    
    setDragX(0);
  };

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext(); // Swipe kiri
    } else if (distance < -minSwipeDistance) {
      handlePrev(); // Swipe kanan
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleBannerClick = (eventId) => {
    if (!isDragging && Math.abs(dragX) < 10 && !isAnimating) {
      navigate(`/detailEvent/${eventId}`);
    }
  };

  const handleCardClick = (id) => navigate(`/detailEvent/${id}`);

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">

          {/* Banner Slider */}
          <div 
            className="w-full aspect-16/6 rounded-xl mb-10 overflow-hidden relative shadow-lg bg-gray-900"
            onMouseEnter={() => setShowArrows(true)}
            onMouseLeave={() => setShowArrows(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Container utama untuk drag + animasi */}
            <motion.div 
              className="relative w-full h-full cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              style={{ x: dragX }}
            >
              {/* Render semua banner untuk continuous effect */}
              {bannerEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  className={`absolute top-0 left-0 w-full h-full ${index === currentBanner ? 'z-10' : 'z-0'}`}
                  // Animasi position berdasarkan state
                  animate={{
                    x: `${(index - currentBanner) * 100}%`
                  }}
                  // Transition yang berbeda untuk drag vs animasi biasa
                  transition={
                    isDragging 
                      ? { type: "spring", stiffness: 300, damping: 30 } // Real-time selama drag
                      : { 
                          type: "tween", 
                          duration: 0.6, // Lebih smooth - 0.6 detik
                          ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuad untuk natural feeling
                        }
                  }
                >
                  <img
                    src={event.banner}
                    alt={event.name}
                    className="w-full h-full object-cover object-center select-none"
                    draggable="false"
                    onClick={() => handleBannerClick(event.id)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Navigation Arrows */}
            <div className={`absolute inset-0 flex items-center justify-between px-4 transition-opacity duration-300 ${showArrows ? 'opacity-100' : 'opacity-0'}`}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="w-10 h-10 bg-[#0C8CE9] bg-opacity-80 rounded-full flex items-center justify-center text-white hover:bg-opacity-100 transition-all z-20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="w-10 h-10 bg-[#0C8CE9] bg-opacity-80 rounded-full flex items-center justify-center text-white hover:bg-opacity-100 transition-all z-20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {bannerEvents.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentBanner(i);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentBanner ? "bg-white" : "bg-white/50 hover:bg-white/80"
                  }`}
                />
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

          {/* Event Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-30">
            {events.slice(0, 5).map((event) => (
              <div
                key={event.id}
                onClick={() => handleCardClick(event.id)}
                className="bg-white border rounded-md shadow-sm overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                <div className="relative w-full pb-[100%] bg-gray-300">
                  <img
                    src={event.poster}
                    alt={event.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>

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