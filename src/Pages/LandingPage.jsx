import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Ticket,
  TrendingUp,
  Music,
  Cpu,
  GraduationCap,
  Dumbbell,
  Briefcase,
  Palette,
  Users,
  UtensilsCrossed,
  Heart,
  Moon,
  Mountain,
  Baby,
  Sparkles,
  ArrowRight,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { eventAPI } from "../services/api";

// Style for hiding scrollbar
const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

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
  const [userRole, setUserRole] = useState(null);

  // Banner state
  const [currentBanner, setCurrentBanner] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Slider refs for horizontal scroll
  const bestSellingSliderRef = useRef(null);
  const popularSliderRef = useRef(null);
  const upcomingSliderRef = useRef(null);
  const [canScrollLeftBestSelling, setCanScrollLeftBestSelling] = useState(false);
  const [canScrollRightBestSelling, setCanScrollRightBestSelling] = useState(true);
  const [canScrollLeftPopular, setCanScrollLeftPopular] = useState(false);
  const [canScrollRightPopular, setCanScrollRightPopular] = useState(true);
  const [canScrollLeftUpcoming, setCanScrollLeftUpcoming] = useState(false);
  const [canScrollRightUpcoming, setCanScrollRightUpcoming] = useState(true);

  // Check scroll position for showing/hiding arrows
  const checkScrollPosition = useCallback((ref, setCanScrollLeft, setCanScrollRight) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  // Scroll handler for slider
  const handleSliderScroll = useCallback((ref, direction) => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

  // Update scroll indicators when content changes
  useEffect(() => {
    checkScrollPosition(bestSellingSliderRef, setCanScrollLeftBestSelling, setCanScrollRightBestSelling);
    checkScrollPosition(popularSliderRef, setCanScrollLeftPopular, setCanScrollRightPopular);
    checkScrollPosition(upcomingSliderRef, setCanScrollLeftUpcoming, setCanScrollRightUpcoming);
  }, [bestSellingEvents, popularEvents, upcomingEvents, checkScrollPosition]);

  // Utility functions
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 10000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };

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

  // Check login status and user role
  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");

    if (userData && token) {
      const user = JSON.parse(userData);
      setIsLoggedIn(true);
      setUserRole(user.role);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, []);

  // Check if user can like (only regular users can like, not admin or organizer)
  const canLike = useMemo(() => {
    return isLoggedIn && userRole === "user";
  }, [isLoggedIn, userRole]);

  // Fetch liked events for logged in user
  useEffect(() => {
    const fetchLikedEvents = async () => {
      if (!canLike) return;
      try {
        const response = await eventAPI.getMyLikedEvents();
        const likedEventIds = new Set(
          (response.data?.liked_event || []).map((e) => e.event_id)
        );
        setLikedEvents(likedEventIds);
      } catch (err) {
        console.error("Error fetching liked events:", err);
      }
    };
    fetchLikedEvents();
  }, [canLike]);

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

        // Sort by total_tickets_sold for best selling (minimum 1 sale, limit 6)
        const bestSelling = [...transformedEvents]
          .filter((e) => e.totalTicketsSold >= 1)
          .sort((a, b) => b.totalTicketsSold - a.totalTicketsSold)
          .slice(0, 6);
        setBestSellingEvents(bestSelling);

        // Fetch popular events (by likes) - minimum 1 like, limit 6
        const popularResponse = await eventAPI.getEventsPopular();
        let popularEventsData = popularResponse.data?.events || [];

        if (popularEventsData.length === 0) {
          // Fallback: sort all events by likes
          popularEventsData = [...transformedEvents]
            .filter((e) => e.totalLikes >= 1)
            .sort((a, b) => b.totalLikes - a.totalLikes)
            .slice(0, 6);
          setPopularEvents(popularEventsData);
        } else {
          // Filter and limit the popular events from API
          const filteredPopular = popularEventsData
            .map(transformEvent)
            .filter((e) => e.totalLikes >= 1)
            .slice(0, 6);
          setPopularEvents(filteredPopular);
        }

        // Filter upcoming events (event yang akan datang) - limit 6
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
      navigate("/login");
      return;
    }

    // Double check role sebelum like
    const userData = sessionStorage.getItem("user");
    if (!userData) return;

    const user = JSON.parse(userData);
    if (user.role !== "user") {
      // Optional: Tampilkan notifikasi bahwa hanya user biasa yang bisa like
      console.log("Hanya user biasa yang dapat melakukan like");
      return;
    }

    // Capture the current like status BEFORE making any state changes
    const isCurrentlyLiked = likedEvents.has(eventId);

    try {
      await eventAPI.likeEvent(eventId);

      // Update likedEvents state
      setLikedEvents((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.delete(eventId);
        } else {
          newSet.add(eventId);
        }
        return newSet;
      });

      // Update like counts in UI menggunakan status yang sudah di-capture
      const updateLikes = (events) =>
        events.map((event) => {
          if (event.id === eventId) {
            return {
              ...event,
              totalLikes: isCurrentlyLiked
                ? Math.max(0, (event.totalLikes || 1) - 1)
                : (event.totalLikes || 0) + 1,
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 mt-20">
      <style>{scrollbarHideStyle}</style>
      <Navbar />
      <section className="pt-20 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Banner Slider */}
          {bannerEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl shadow-gray-300/30 bg-gray-900"
              style={{ aspectRatio: "16/6" }}
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
                      <div className="absolute inset-0" />
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
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-all z-20 shadow-lg"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-all z-20 shadow-lg"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                    </motion.button>
                  </>
                )}
              </AnimatePresence>

              {/* Dots Indicator */}
              {bannerEvents.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
                  {bannerEvents.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentBanner(i);
                      }}
                      className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                        i === currentBanner
                          ? "bg-white w-4 sm:w-8"
                          : "bg-white/50 w-1.5 sm:w-2 hover:bg-white/80"
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
        <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  Jelajahi Kategori
                </h2>
                <button
                  onClick={() => navigate("/cariEvent")}
                  className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base"
                >
                  Lihat Semua
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4">
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
                      className={`group p-2 sm:p-4 ${
                        catData?.bgLight || "bg-gray-50"
                      } rounded-lg sm:rounded-2xl hover:shadow-md sm:hover:shadow-lg transition-all duration-300 flex flex-col items-center gap-1.5 sm:gap-3`}
                    >
                      <div
                        className={`w-8 h-8 sm:w-12 sm:h-12 ${
                          catData?.color || "bg-gray-500"
                        } rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 text-center line-clamp-2 leading-tight">
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
      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    Event Terlaris
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Event dengan penjualan tiket terbanyak
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/carievent?sort=terlaris")}
                className="flex items-center gap-1 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                Lihat Semua
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            {bestSellingEvents.length > 0 ? (
              <div className="relative group/slider">
                {/* Left Arrow */}
                <button
                  onClick={() => handleSliderScroll(bestSellingSliderRef, 'left')}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:bg-emerald-50 hover:scale-110 -ml-3 sm:-ml-4 ${
                    canScrollLeftBestSelling ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </button>

                {/* Right Arrow */}
                <button
                  onClick={() => handleSliderScroll(bestSellingSliderRef, 'right')}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:bg-emerald-50 hover:scale-110 -mr-3 sm:-mr-4 ${
                    canScrollRightBestSelling ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </button>

                {/* Scrollable Container */}
                <div
                  ref={bestSellingSliderRef}
                  onScroll={() => checkScrollPosition(bestSellingSliderRef, setCanScrollLeftBestSelling, setCanScrollRightBestSelling)}
                  className="flex gap-3 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {bestSellingEvents.slice(0, 6).map((event, index) => (
                    <div key={event.id} className="flex-shrink-0 w-[calc(50%-6px)] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]">
                      <EventCard
                        event={event}
                        index={index}
                        onClick={() => navigate(`/detailEvent/${event.id}`)}
                        formatRupiah={formatRupiah}
                        formatNumber={formatNumber}
                        getCategoryData={getCategoryData}
                        getParentCategory={getParentCategory}
                        isLiked={likedEvents.has(event.id)}
                        onLike={(e) => handleLikeEvent(event.id, e)}
                        isLoggedIn={isLoggedIn}
                        canLike={canLike}
                        showSales
                      />
                    </div>
                  ))}
                </div>
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
      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    Event Populer
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Event dengan likes terbanyak
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/carievent?sort=popularitas")}
                className="flex items-center gap-1 sm:gap-2 bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                Lihat Semua
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            {popularEvents.length > 0 ? (
              <div className="relative group/slider">
                {/* Left Arrow */}
                <button
                  onClick={() => handleSliderScroll(popularSliderRef, 'left')}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:bg-pink-50 hover:scale-110 -ml-3 sm:-ml-4 ${
                    canScrollLeftPopular ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                </button>

                {/* Right Arrow */}
                <button
                  onClick={() => handleSliderScroll(popularSliderRef, 'right')}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:bg-pink-50 hover:scale-110 -mr-3 sm:-mr-4 ${
                    canScrollRightPopular ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                </button>

                {/* Scrollable Container */}
                <div
                  ref={popularSliderRef}
                  onScroll={() => checkScrollPosition(popularSliderRef, setCanScrollLeftPopular, setCanScrollRightPopular)}
                  className="flex gap-3 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {popularEvents.slice(0, 6).map((event, index) => (
                    <div key={event.id} className="flex-shrink-0 w-[calc(50%-6px)] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]">
                      <EventCard
                        event={event}
                        index={index}
                        onClick={() => navigate(`/detailEvent/${event.id}`)}
                        formatRupiah={formatRupiah}
                        formatNumber={formatNumber}
                        getCategoryData={getCategoryData}
                        getParentCategory={getParentCategory}
                        isLiked={likedEvents.has(event.id)}
                        onLike={(e) => handleLikeEvent(event.id, e)}
                        isLoggedIn={isLoggedIn}
                        canLike={canLike}
                        showLikes
                      />
                    </div>
                  ))}
                </div>
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
        <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-8">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      Segera Digelar
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Event yang akan datang dalam waktu dekat
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/kalender-event")}
                  className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base"
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Lihat Kalender</span>
                  <span className="sm:hidden">Kalender</span>
                </button>
              </div>

              {/* Desktop: Grid Layout */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {upcomingEvents.slice(0, 6).map((event, index) => (
                  <UpcomingEventCard
                    key={event.id}
                    event={event}
                    index={index}
                    onClick={() => navigate(`/detailEvent/${event.id}`)}
                    formatRupiah={formatRupiah}
                    formatNumber={formatNumber}
                    getCategoryData={getCategoryData}
                    getParentCategory={getParentCategory}
                    isLiked={likedEvents.has(event.id)}
                    onLike={(e) => handleLikeEvent(event.id, e)}
                    isLoggedIn={isLoggedIn}
                    canLike={canLike}
                  />
                ))}
              </div>

              {/* Mobile: Horizontal Slider with 2 Rows (3 columns x 2 rows) */}
              <div className="sm:hidden relative group/slider">
                {/* Left Arrow */}
                <button
                  onClick={() => handleSliderScroll(upcomingSliderRef, 'left')}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:bg-blue-50 hover:scale-110 -ml-3 ${
                    canScrollLeftUpcoming ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 text-blue-600" />
                </button>

                {/* Right Arrow */}
                <button
                  onClick={() => handleSliderScroll(upcomingSliderRef, 'right')}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:bg-blue-50 hover:scale-110 -mr-3 ${
                    canScrollRightUpcoming ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                </button>

                {/* Scrollable Container with 2 rows */}
                <div
                  ref={upcomingSliderRef}
                  onScroll={() => checkScrollPosition(upcomingSliderRef, setCanScrollLeftUpcoming, setCanScrollRightUpcoming)}
                  className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {/* Group events into columns of 2 */}
                  {Array.from({ length: Math.ceil(upcomingEvents.slice(0, 6).length / 2) }).map((_, colIndex) => (
                    <div key={colIndex} className="flex-shrink-0 w-[75vw] max-w-[280px] flex flex-col gap-3">
                      {upcomingEvents.slice(0, 6).slice(colIndex * 2, colIndex * 2 + 2).map((event, index) => (
                        <UpcomingEventCard
                          key={event.id}
                          event={event}
                          index={colIndex * 2 + index}
                          onClick={() => navigate(`/detailEvent/${event.id}`)}
                          formatRupiah={formatRupiah}
                          formatNumber={formatNumber}
                          getCategoryData={getCategoryData}
                          getParentCategory={getParentCategory}
                          isLiked={likedEvents.has(event.id)}
                          onLike={(e) => handleLikeEvent(event.id, e)}
                          isLoggedIn={isLoggedIn}
                          canLike={canLike}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-3xl p-6 sm:p-12 text-center overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">
                Siap Menemukan Event Impianmu?
              </h2>
              <p className="text-blue-100 mb-6 sm:mb-8 max-w-xl mx-auto text-sm sm:text-base">
                Jelajahi semua event yang tersedia dan dapatkan tiket untuk
                pengalaman tak terlupakan
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => navigate("/carievent")}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2.5 sm:px-8 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-colors text-sm sm:text-base"
                >
                  Jelajahi Event
                </button>
                <button
                  onClick={() => navigate("/kalender-event")}
                  className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
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
            className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl shadow-lg z-50 text-sm sm:text-base max-w-xs sm:max-w-md text-center"
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
  formatNumber,
  getCategoryData,
  getParentCategory,
  isLiked,
  onLike,
  isLoggedIn,
  canLike,
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
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group bg-white rounded-lg sm:rounded-2xl shadow-sm hover:shadow-md sm:hover:shadow-xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-full" // Tambahkan flex flex-col h-full
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 flex-shrink-0"> {/* Tambahkan flex-shrink-0 */}
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
                '<div class="text-gray-400"><svg class="w-8 h-8 sm:w-16 sm:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Ticket className="w-8 h-8 sm:w-16 sm:h-16" />
          </div>
        )}
        {/* Category Badge */}
        {event.category && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <span
              className={`${catData.color} text-white text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-medium`}
            >
              {parentCategory}
            </span>
          </div>
        )}
        {/* Like Button */}
        <button
          onClick={onLike}
          disabled={!canLike}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
            !canLike
              ? "bg-white/90 text-gray-400 cursor-not-allowed"
              : isLiked
              ? "bg-pink-500 text-white"
              : "bg-white/90 text-gray-600 hover:bg-pink-100 hover:text-pink-500"
          }`}
          title={
            !canLike
              ? "Fitur like hanya tersedia untuk user biasa"
              : isLiked
              ? "Unlike"
              : "Like"
          }
        >
          <Heart
            className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? "fill-current" : ""}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-4"> {/* Tambahkan flex flex-col flex-1 */}
        {/* Judul dengan tinggi tetap */}
        <div className="min-h-[3.5rem] sm:min-h-[4rem] mb-1.5 sm:mb-2 flex items-start"> {/* Container dengan tinggi minimum */}
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {event.name}
          </h3>
        </div>

        <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{event.date}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 mt-auto"> {/* Tambahkan mt-auto */}
          <div>
            <p className="text-xs text-gray-400">Mulai dari</p>
            <p
              className={`font-bold text-sm sm:text-base ${
                event.price === 0 ? "text-emerald-600" : "text-blue-600"
              }`}
            >
              {formatRupiah(event.price)}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {showSales && event.totalTicketsSold > 0 && (
              <div className="flex items-center gap-1 text-emerald-600 text-xs sm:text-sm">
                <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium">{formatNumber(event.totalTicketsSold)}</span>
              </div>
            )}
            {showLikes && event.totalLikes > 0 && (
              <div className="flex items-center gap-1 text-pink-500 text-xs sm:text-sm">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                <span className="font-medium">{formatNumber(event.totalLikes)}</span>
              </div>
            )}
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 group-hover:text-white transition-colors" />
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
  formatNumber,
  getCategoryData,
  getParentCategory,
  isLiked,
  onLike,
  isLoggedIn,
  canLike,
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
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group bg-white rounded-lg sm:rounded-2xl shadow-sm hover:shadow-md sm:hover:shadow-xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 h-full" // Tambahkan h-full
    >
      <div className="flex h-full"> {/* Tambahkan h-full */}
        {/* Date Badge */}
        <div className="w-16 sm:w-20 bg-gradient-to-b from-blue-600 to-blue-700 flex flex-col items-center justify-center text-white py-3 sm:py-4 flex-shrink-0">
          {event.dateStart && (
            <>
              <span className="text-lg sm:text-2xl font-bold">
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
        <div className="flex-1 p-2.5 sm:p-4 flex flex-col"> {/* Tambahkan flex flex-col */}
          <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <div className="flex-1 min-w-0">
              {event.category && (
                <span
                  className={`${catData.color} text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full font-medium`}
                >
                  {parentCategory}
                </span>
              )}
              {/* Container judul dengan tinggi tetap */}
              <div className="min-h-[3rem] sm:min-h-[3.5rem] mt-1 sm:mt-1.5 flex items-start"> {/* Container dengan tinggi minimum */}
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm sm:text-base leading-tight">
                  {event.name}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {daysUntil !== null && daysUntil >= 0 && (
                <span className="bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium whitespace-nowrap">
                  {daysUntil === 0
                    ? "Hari ini"
                    : daysUntil === 1
                    ? "Besok"
                    : `${daysUntil} hari`}
                </span>
              )}
              <button
                onClick={onLike}
                disabled={!canLike}
                className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${
                  !canLike
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : isLiked
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-500"
                }`}
                title={
                  !canLike
                    ? "Fitur like hanya tersedia untuk user biasa"
                    : isLiked
                    ? "Unlike"
                    : "Like"
                }
              >
                <Heart
                  className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${
                    isLiked ? "fill-current" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-auto"> {/* Tambahkan mt-auto */}
            <p
              className={`font-bold text-sm sm:text-base ${
                event.price === 0 ? "text-emerald-600" : "text-blue-600"
              }`}
            >
              {formatRupiah(event.price)}
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {event.totalLikes > 0 && (
                <span className="flex items-center gap-0.5 text-pink-500 text-xs">
                  <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                  {formatNumber(event.totalLikes)}
                </span>
              )}
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
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
    <div className="text-center py-10 sm:py-16">
      <div className="w-12 h-12 sm:w-20 sm:h-20 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <Icon className="w-6 h-6 sm:w-10 sm:h-10 text-gray-400" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">
        {title}
      </h3>
      <p className="text-gray-500 text-sm sm:text-base">{description}</p>
    </div>
  );
}