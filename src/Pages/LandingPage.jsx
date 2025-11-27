import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Ticket, TrendingUp, Music, Cpu, GraduationCap, Dumbbell, Briefcase, Palette, Users, UtensilsCrossed, Heart, Moon, Mountain, Baby, Sparkles, ArrowRight, Clock, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { eventAPI } from "../services/api";

// Category dengan icon dan warna yang konsisten dengan CalendarEventPage
const CATEGORY_DATA = {
  Hiburan: {
    icon: Music,
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    textColor: "text-purple-600",
    bgLight: "bg-purple-50",
  },
  Teknologi: {
    icon: Cpu,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    textColor: "text-blue-600",
    bgLight: "bg-blue-50",
  },
  Edukasi: {
    icon: GraduationCap,
    color: "bg-cyan-500",
    hoverColor: "hover:bg-cyan-600",
    textColor: "text-cyan-600",
    bgLight: "bg-cyan-50",
  },
  Olahraga: {
    icon: Dumbbell,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    textColor: "text-green-600",
    bgLight: "bg-green-50",
  },
  "Bisnis & Profesional": {
    icon: Briefcase,
    color: "bg-amber-500",
    hoverColor: "hover:bg-amber-600",
    textColor: "text-amber-600",
    bgLight: "bg-amber-50",
  },
  "Seni & Budaya": {
    icon: Palette,
    color: "bg-pink-500",
    hoverColor: "hover:bg-pink-600",
    textColor: "text-pink-600",
    bgLight: "bg-pink-50",
  },
  Komunitas: {
    icon: Users,
    color: "bg-indigo-500",
    hoverColor: "hover:bg-indigo-600",
    textColor: "text-indigo-600",
    bgLight: "bg-indigo-50",
  },
  Kuliner: {
    icon: UtensilsCrossed,
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    textColor: "text-orange-600",
    bgLight: "bg-orange-50",
  },
  Kesehatan: {
    icon: Heart,
    color: "bg-red-500",
    hoverColor: "hover:bg-red-600",
    textColor: "text-red-600",
    bgLight: "bg-red-50",
  },
  "Agama & Spiritual": {
    icon: Moon,
    color: "bg-teal-500",
    hoverColor: "hover:bg-teal-600",
    textColor: "text-teal-600",
    bgLight: "bg-teal-50",
  },
  "Travel & Outdoor": {
    icon: Mountain,
    color: "bg-emerald-500",
    hoverColor: "hover:bg-emerald-600",
    textColor: "text-emerald-600",
    bgLight: "bg-emerald-50",
  },
  "Keluarga & Anak": {
    icon: Baby,
    color: "bg-rose-500",
    hoverColor: "hover:bg-rose-600",
    textColor: "text-rose-600",
    bgLight: "bg-rose-50",
  },
  "Fashion & Beauty": {
    icon: Sparkles,
    color: "bg-fuchsia-500",
    hoverColor: "hover:bg-fuchsia-600",
    textColor: "text-fuchsia-600",
    bgLight: "bg-fuchsia-50",
  },
};

// Mapping child category ke parent
const CATEGORIES = {
  Hiburan: [
    "Musik",
    "Konser",
    "Festival",
    "Stand Up Comedy",
    "Film",
    "Teater",
    "K-Pop",
    "Dance Performance",
  ],
  Teknologi: [
    "Konferensi Teknologi",
    "Workshop IT",
    "Startup",
    "Software Development",
    "Artificial Intelligence",
    "Data Science",
    "Cybersecurity",
    "Gaming & Esports",
  ],
  Edukasi: [
    "Seminar",
    "Workshop",
    "Pelatihan",
    "Webinar",
    "Bootcamp",
    "Kelas Online",
    "Literasi Digital",
    "Kelas Bisnis",
  ],
  Olahraga: [
    "Marathon",
    "Fun Run",
    "Sepak Bola",
    "Badminton",
    "Gym & Fitness",
    "Yoga",
    "Esport",
    "Cycling Event",
  ],
  "Bisnis & Profesional": [
    "Konferensi Bisnis",
    "Networking",
    "Karir",
    "Entrepreneurship",
    "Leadership",
    "Startup Meetup",
    "Investor & Pitching",
  ],
  "Seni & Budaya": [
    "Pameran Seni",
    "Pentas Budaya",
    "Fotografi",
    "Seni Rupa",
    "Crafting",
    "Pameran Museum",
    "Fashion Show",
  ],
  Komunitas: [
    "Kegiatan Relawan",
    "Kegiatan Sosial",
    "Gathering Komunitas",
    "Komunitas Hobi",
    "Meetup",
    "Charity Event",
  ],
  Kuliner: [
    "Festival Kuliner",
    "Food Tasting",
    "Workshop Memasak",
    "Street Food Event",
  ],
  Kesehatan: [
    "Seminar Kesehatan",
    "Medical Check Event",
    "Workshop Kesehatan Mental",
    "Donor Darah",
  ],
  "Agama & Spiritual": [
    "Kajian",
    "Retreat",
    "Pengajian",
    "Event Keagamaan",
    "Meditasi",
  ],
  "Travel & Outdoor": [
    "Camping",
    "Hiking",
    "Trip Wisata",
    "Outdoor Gathering",
    "Photography Trip",
  ],
  "Keluarga & Anak": [
    "Family Gathering",
    "Event Anak",
    "Workshop Parenting",
    "Pentas Anak",
  ],
  "Fashion & Beauty": [
    "Fashion Expo",
    "Beauty Class",
    "Makeup Workshop",
    "Brand Launching",
  ],
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [bestSellingEvents, setBestSellingEvents] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedEvents, setLikedEvents] = useState(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Banner state
  const [currentBanner, setCurrentBanner] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Utility functions
  const formatRupiah = (angka) => {
    if (angka === 0) return "GRATIS";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatEventDate = (dateStart, dateEnd) => {
    if (!dateStart) return "-";
    const start = new Date(dateStart);
    const end = dateEnd ? new Date(dateEnd) : start;

    const formatDate = (date) => {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    };

    if (start.toDateString() === end.toDateString()) {
      return formatDate(start);
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getLowestPrice = (ticketCategories) => {
    if (!ticketCategories || ticketCategories.length === 0) return 0;
    const prices = ticketCategories.map((tc) => tc.price);
    return Math.min(...prices);
  };

  const getParentCategory = (category) => {
    if (!category) return "Lainnya";
    if (CATEGORIES[category]) return category;
    for (const [parent, children] of Object.entries(CATEGORIES)) {
      if (children.includes(category)) return parent;
    }
    return "Lainnya";
  };

  const getCategoryData = (category) => {
    const parent = getParentCategory(category);
    return (
      CATEGORY_DATA[parent] || {
        icon: Ticket,
        color: "bg-gray-500",
        hoverColor: "hover:bg-gray-600",
        textColor: "text-gray-600",
        bgLight: "bg-gray-50",
      }
    );
  };

  // Check login status
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Fetch liked events for logged in user
  useEffect(() => {
    const fetchLikedEvents = async () => {
      if (!isLoggedIn) return;
      try {
        const response = await eventAPI.getMyLikedEvents();
        const likedEventIds = new Set(
          (response.data?.liked_event || []).map(e => e.event_id)
        );
        setLikedEvents(likedEventIds);
      } catch (err) {
        console.error("Error fetching liked events:", err);
      }
    };
    fetchLikedEvents();
  }, [isLoggedIn]);

  // Transform event data
  const transformEvent = (event) => ({
    id: event.event_id || event.id,
    name: event.name,
    date: formatEventDate(event.date_start, event.date_end),
    dateStart: event.date_start,
    dateEnd: event.date_end,
    price: getLowestPrice(event.ticket_categories),
    poster: event.image,
    banner: event.flyer || event.image,
    category: event.category,
    location: event.venue || event.location,
    district: event.district,
    totalLikes: event.total_likes || 0,
    totalTicketsSold: event.total_tickets_sold || 0,
    originalData: event,
  });

  // Fetch events dari backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all approved events
        const approvedResponse = await eventAPI.getApprovedEvents();
        const allEvents = approvedResponse.data || [];

        // Transform all events
        const transformedEvents = allEvents.map(transformEvent);

        // Sort by total_tickets_sold for best selling
        const bestSelling = [...transformedEvents]
          .sort((a, b) => b.totalTicketsSold - a.totalTicketsSold)
          .slice(0, 8);
        setBestSellingEvents(bestSelling);

        // Fetch popular events (by likes)
        const popularResponse = await eventAPI.getEventsPopular();
        let popularEventsData = popularResponse.data?.events || [];
        
        if (popularEventsData.length === 0) {
          // Fallback: sort all events by likes
          popularEventsData = [...transformedEvents]
            .sort((a, b) => b.totalLikes - a.totalLikes)
            .slice(0, 8);
          setPopularEvents(popularEventsData);
        } else {
          setPopularEvents(popularEventsData.map(transformEvent));
        }

        // Filter upcoming events (event yang akan datang)
        const now = new Date();
        const upcoming = transformedEvents
          .filter((e) => e.dateStart && new Date(e.dateStart) >= now)
          .sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart))
          .slice(0, 6);
        setUpcomingEvents(upcoming);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Gagal memuat data event. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle like event
  const handleLikeEvent = async (eventId, e) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Capture the current like status BEFORE making any state changes
    const isCurrentlyLiked = likedEvents.has(eventId);

    try {
      await eventAPI.likeEvent(eventId);
      
      // Update likedEvents state
      setLikedEvents(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.delete(eventId);
        } else {
          newSet.add(eventId);
        }
        return newSet;
      });

      // Update like counts in UI using the captured status
      const updateLikes = (events) => events.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            totalLikes: isCurrentlyLiked 
              ? Math.max(0, (event.totalLikes || 1) - 1) 
              : (event.totalLikes || 0) + 1
          };
        }
        return event;
      });

      setBestSellingEvents(updateLikes);
      setPopularEvents(updateLikes);
      setUpcomingEvents(updateLikes);
    } catch (err) {
      console.error("Error liking event:", err);
    }
  };

  // Banner events (max 5)
  const bannerEvents = useMemo(
    () => bestSellingEvents.filter((e) => e.banner).slice(0, 5),
    [bestSellingEvents]
  );

  // Auto slide banner
  useEffect(() => {
    if (bannerEvents.length <= 1) return;
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

  // Drag handlers
  const handleDragStart = () => setIsDragging(true);
  const handleDrag = (event, info) => setDragX(info.offset.x);
  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    setDragX(0);
    const threshold = 100;
    setTimeout(() => {
      if (info.offset.x < -threshold) handleNext();
      else if (info.offset.x > threshold) handlePrev();
      else {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 400);
      }
    }, 50);
  };

  // Touch handlers
  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) handleNext();
    else if (distance < -50) handlePrev();
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleBannerClick = (eventId) => {
    if (!isDragging && Math.abs(dragX) < 10 && !isAnimating) {
      navigate(`/detailEvent/${eventId}`);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/carievent?category=${encodeURIComponent(category)}`);
  };

  // Available categories dari events yang ada
  const availableCategories = useMemo(() => {
    const cats = new Set();
    bestSellingEvents.forEach((event) => {
      const parent = getParentCategory(event.category);
      if (parent !== "Lainnya") cats.add(parent);
    });
    return Array.from(cats).slice(0, 8);
  }, [bestSellingEvents]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Memuat event...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Navbar />
      <section className="pt-46 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Temukan Event <span className="text-blue-600">Terbaik</span> di
              Kotamu
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Jelajahi ribuan event menarik, dari konser musik hingga workshop
              profesional
            </p>
          </motion.div>

          {/* Banner Slider */}
          {bannerEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl shadow-gray-300/30 bg-gray-900"
              style={{ aspectRatio: "21/9" }}
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
                    className={`absolute inset-0 ${
                      index === currentBanner ? "z-10" : "z-0"
                    }`}
                    animate={{ x: `${(index - currentBanner) * 100}%` }}
                    transition={
                      isDragging
                        ? { type: "tween", duration: 0.1 }
                        : {
                            type: "tween",
                            duration: 0.5,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }
                    }
                  >
                    <div
                      className="relative w-full h-full"
                      onClick={() => handleBannerClick(event.id)}
                    >
                      <img
                        src={event.banner}
                        alt={event.name}
                        className="w-full h-full object-cover select-none"
                        draggable="false"
                        onError={(e) => {
                          e.target.src = event.poster || "";
                        }}
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      {/* Event Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{
                            opacity: index === currentBanner ? 1 : 0,
                            y: index === currentBanner ? 0 : 20,
                          }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          {event.category && (
                            <span
                              className={`${
                                getCategoryData(event.category).color
                              } text-white text-xs px-3 py-1 rounded-full font-medium mb-3 inline-block`}
                            >
                              {getParentCategory(event.category)}
                            </span>
                          )}
                          <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-2 line-clamp-2">
                            {event.name}
                          </h2>
                          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {event.date}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Navigation Arrows */}
              <AnimatePresence>
                {showArrows && bannerEvents.length > 1 && (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-all z-20 shadow-lg"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-all z-20 shadow-lg"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </motion.button>
                  </>
                )}
              </AnimatePresence>

              {/* Dots Indicator */}
              {bannerEvents.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {bannerEvents.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentBanner(i);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentBanner
                          ? "bg-white w-8"
                          : "bg-white/50 w-2 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Quick Category Section */}
      {availableCategories.length > 0 && (
        <section className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Jelajahi Kategori
                </h2>
                <button
                  onClick={() => navigate("/cariEvent")}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                >
                  Lihat Semua
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                {availableCategories.map((category, index) => {
                  const catData = CATEGORY_DATA[category];
                  const IconComponent = catData?.icon || Ticket;
                  return (
                    <motion.button
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      onClick={() => handleCategoryClick(category)}
                      className={`group p-4 ${
                        catData?.bgLight || "bg-gray-50"
                      } rounded-2xl hover:shadow-lg transition-all duration-300 flex flex-col items-center gap-3`}
                    >
                      <div
                        className={`w-12 h-12 ${
                          catData?.color || "bg-gray-500"
                        } rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 text-center line-clamp-2">
                        {category}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Best Selling Events Section (previously Popular) */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Event Terlaris
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Event dengan penjualan tiket terbanyak
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/carievent?sort=terlaris")}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {bestSellingEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {bestSellingEvents.slice(0, 8).map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    onClick={() => navigate(`/detailEvent/${event.id}`)}
                    formatRupiah={formatRupiah}
                    getCategoryData={getCategoryData}
                    getParentCategory={getParentCategory}
                    isLiked={likedEvents.has(event.id)}
                    onLike={(e) => handleLikeEvent(event.id, e)}
                    isLoggedIn={isLoggedIn}
                    showSales
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Ticket}
                title="Belum Ada Event"
                description="Saat ini belum ada event yang tersedia. Silakan cek kembali nanti."
              />
            )}
          </motion.div>
        </div>
      </section>

      {/* Popular Events Section (by Likes) */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Event Populer
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Event dengan likes terbanyak
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/carievent?sort=popularitas")}
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {popularEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {popularEvents.slice(0, 8).map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    onClick={() => navigate(`/detailEvent/${event.id}`)}
                    formatRupiah={formatRupiah}
                    getCategoryData={getCategoryData}
                    getParentCategory={getParentCategory}
                    isLiked={likedEvents.has(event.id)}
                    onLike={(e) => handleLikeEvent(event.id, e)}
                    isLoggedIn={isLoggedIn}
                    showLikes
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Heart}
                title="Belum Ada Event Populer"
                description="Saat ini belum ada event populer. Silakan cek kembali nanti."
              />
            )}
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Segera Digelar
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Event yang akan datang dalam waktu dekat
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/kalender-event")}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Lihat Kalender
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event, index) => (
                  <UpcomingEventCard
                    key={event.id}
                    event={event}
                    index={index}
                    onClick={() => navigate(`/detailEvent/${event.id}`)}
                    formatRupiah={formatRupiah}
                    getCategoryData={getCategoryData}
                    getParentCategory={getParentCategory}
                    isLiked={likedEvents.has(event.id)}
                    onLike={(e) => handleLikeEvent(event.id, e)}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-center overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Siap Menemukan Event Impianmu?
              </h2>
              <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                Jelajahi semua event yang tersedia dan dapatkan tiket untuk
                pengalaman tak terlupakan
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/carievent")}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-semibold transition-colors"
                >
                  Jelajahi Event
                </button>
                <button
                  onClick={() => navigate("/kalender-event")}
                  className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Lihat Kalender
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Event Card Component
function EventCard({
  event,
  index,
  onClick,
  formatRupiah,
  getCategoryData,
  getParentCategory,
  isLiked,
  onLike,
  isLoggedIn,
  showSales,
  showLikes,
}) {
  const catData = getCategoryData(event.category);
  const parentCategory = getParentCategory(event.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {event.poster ? (
          <img
            src={event.poster}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.classList.add(
                "flex",
                "items-center",
                "justify-center"
              );
              e.target.parentElement.innerHTML =
                '<div class="text-gray-400"><svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Ticket className="w-16 h-16" />
          </div>
        )}
        {/* Category Badge */}
        {event.category && (
          <div className="absolute top-3 left-3">
            <span
              className={`${catData.color} text-white text-xs px-2.5 py-1 rounded-full font-medium`}
            >
              {parentCategory}
            </span>
          </div>
        )}
        {/* Like Button */}
        <button
          onClick={onLike}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isLiked 
              ? 'bg-pink-500 text-white' 
              : 'bg-white/90 text-gray-600 hover:bg-pink-100 hover:text-pink-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.name}
        </h3>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{event.date}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Mulai dari</p>
            <p
              className={`font-bold ${
                event.price === 0 ? "text-emerald-600" : "text-blue-600"
              }`}
            >
              {formatRupiah(event.price)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {showSales && event.totalTicketsSold > 0 && (
              <div className="flex items-center gap-1 text-emerald-600 text-sm">
                <ShoppingBag className="w-4 h-4" />
                <span className="font-medium">{event.totalTicketsSold}</span>
              </div>
            )}
            {showLikes && event.totalLikes > 0 && (
              <div className="flex items-center gap-1 text-pink-500 text-sm">
                <Heart className="w-4 h-4 fill-current" />
                <span className="font-medium">{event.totalLikes}</span>
              </div>
            )}
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Upcoming Event Card Component
function UpcomingEventCard({
  event,
  index,
  onClick,
  formatRupiah,
  getCategoryData,
  getParentCategory,
  isLiked,
  onLike,
  isLoggedIn,
}) {
  const catData = getCategoryData(event.category);
  const parentCategory = getParentCategory(event.category);

  // Calculate days until event
  const daysUntil = event.dateStart
    ? Math.ceil(
        (new Date(event.dateStart) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300"
    >
      <div className="flex">
        {/* Date Badge */}
        <div className="w-20 bg-gradient-to-b from-blue-600 to-blue-700 flex flex-col items-center justify-center text-white py-4 flex-shrink-0">
          {event.dateStart && (
            <>
              <span className="text-2xl font-bold">
                {new Date(event.dateStart).getDate()}
              </span>
              <span className="text-xs uppercase tracking-wide opacity-80">
                {new Date(event.dateStart).toLocaleDateString("id-ID", {
                  month: "short",
                })}
              </span>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              {event.category && (
                <span
                  className={`${catData.color} text-white text-xs px-2 py-0.5 rounded-full font-medium`}
                >
                  {parentCategory}
                </span>
              )}
              <h3 className="font-semibold text-gray-900 mt-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {event.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {daysUntil !== null && daysUntil >= 0 && (
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">
                  {daysUntil === 0
                    ? "Hari ini"
                    : daysUntil === 1
                    ? "Besok"
                    : `${daysUntil} hari lagi`}
                </span>
              )}
              <button
                onClick={onLike}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  isLiked 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-500'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p
              className={`font-bold ${
                event.price === 0 ? "text-emerald-600" : "text-blue-600"
              }`}
            >
              {formatRupiah(event.price)}
            </p>
            <div className="flex items-center gap-2">
              {event.totalLikes > 0 && (
                <span className="flex items-center gap-1 text-pink-500 text-xs">
                  <Heart className="w-3 h-3 fill-current" />
                  {event.totalLikes}
                </span>
              )}
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Empty State Component
function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}