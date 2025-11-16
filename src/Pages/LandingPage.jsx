import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { eventAPI } from "../services/api"; // Import API

export default function LandingPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Format date dari backend
  const formatEventDate = (dateStart, dateEnd) => {
    const start = new Date(dateStart);
    const end = new Date(dateEnd);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };

    if (start.toDateString() === end.toDateString()) {
      return formatDate(start);
    } else {
      return `${formatDate(start)} - ${formatDate(end)}`;
    }
  };

  // Get harga termurah dari kategori tiket
  const getLowestPrice = (ticketCategories) => {
    if (!ticketCategories || ticketCategories.length === 0) return 0;
    
    const prices = ticketCategories.map(tc => tc.price);
    return Math.min(...prices);
  };

  // Fetch events dari backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Ambil event popular dari backend
        const popularResponse = await eventAPI.getEventsPopular();
        const popularEvents = popularResponse.data.events || [];
        
        // Jika tidak ada event popular, ambil event approved biasa
        let eventsData = popularEvents;
        if (popularEvents.length === 0) {
          const approvedResponse = await eventAPI.getApprovedEvents();
          eventsData = approvedResponse.data || [];
        }

        // Transform data dari backend ke format frontend
        const transformedEvents = eventsData.map((event, index) => ({
          id: event.event_id || event.id || index + 1,
          name: event.name,
          date: formatEventDate(event.date_start, event.date_end),
          price: getLowestPrice(event.ticket_categories),
          poster: event.image || `https://picsum.photos/800/800?random=${index + 11}`,
          banner: event.flyer || `https://picsum.photos/1200/600?random=${index + 11}`,
          // Simpan data asli untuk kebutuhan lain
          originalData: event
        }));

        setEvents(transformedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Gagal memuat data event");
        // Fallback ke data dummy jika error
        setEvents([
          {
            id: 1,
            name: "Jakarta Music Festival",
            date: "29 Nov 2025 - 30 Nov 2025",
            price: 100000,
            poster: "https://picsum.photos/800/800?random=11",
            banner: "https://picsum.photos/1200/600?random=11",
          },
          {
            id: 2,
            name: "Tech Expo Indonesia",
            date: "15 Des 2025 - 17 Des 2025",
            price: 150000,
            poster: "https://picsum.photos/800/800?random=22",
            banner: "https://picsum.photos/1200/600?random=22",
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Data untuk banner (ambil 3-5 event pertama)
  const bannerEvents = events.slice(0, 5);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto slide - hanya jika tidak sedang drag atau animasi
  useEffect(() => {
    if (bannerEvents.length === 0) return;
    
    const timer = setInterval(() => {
      if (!isDragging && !isAnimating) {
        handleNext();
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [currentBanner, isDragging, isAnimating, bannerEvents.length]);

  const handleNext = useCallback(() => {
    if (bannerEvents.length === 0) return;
    setIsAnimating(true);
    setCurrentBanner((prev) => (prev + 1) % bannerEvents.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [bannerEvents.length]);

  const handlePrev = useCallback(() => {
    if (bannerEvents.length === 0) return;
    setIsAnimating(true);
    setCurrentBanner(
      (prev) => (prev - 1 + bannerEvents.length) % bannerEvents.length
    );
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

    setDragX(0);
    
    setTimeout(() => {
      if (info.offset.x < -threshold) {
        handleNext();
      } else if (info.offset.x > threshold) {
        handlePrev();
      } else {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 400);
      }
    }, 50);
  };

  // Touch handlers
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleBannerClick = (eventId) => {
    if (!isDragging && Math.abs(dragX) < 10 && !isAnimating) {
      navigate(`/detailEvent/${eventId}`);
    }
  };

  const handleCardClick = (id) => navigate(`/detailEvent/${id}`);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat event...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center">
          <div className="text-center text-red-600">
            <p>{error}</p>
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
          {/* Banner Slider - hanya tampil jika ada data */}
          {bannerEvents.length > 0 && (
            <div
              className="w-full aspect-16/6 rounded-xl mb-10 overflow-hidden relative shadow-lg bg-gray-900"
              onMouseEnter={() => setShowArrows(true)}
              onMouseLeave={() => setShowArrows(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <motion.div
                className="relative w-full h-full cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                style={{ x: dragX }}
              >
                {bannerEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    className={`absolute top-0 left-0 w-full h-full ${
                      index === currentBanner ? "z-10" : "z-0"
                    }`}
                    animate={{
                      x: `${(index - currentBanner) * 100}%`,
                    }}
                    transition={
                      isDragging
                        ? { type: "tween", duration: 0.1 }
                        : {
                            type: "tween",
                            duration: 0.5,
                            ease: [0.25, 0.46, 0.45, 0.94]
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
              <div
                className={`absolute inset-0 flex items-center justify-between px-4 transition-opacity duration-300 ${
                  showArrows ? "opacity-100" : "opacity-0"
                }`}
              >
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
                      i === currentBanner
                        ? "bg-white"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

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
          {events.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-30">
              {events.slice(0, 8).map((event) => (
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
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/800/800?random=${event.id}`;
                      }}
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
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Tidak ada event tersedia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}