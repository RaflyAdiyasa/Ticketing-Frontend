import {
  Menu,
  Search,
  ShoppingCart,
  X,
  History,
  LogOut,
  User,
  Home,
  Ticket,
  Calendar,
  CalendarDays,
  ShieldCheck,
  Crown,
  Star,
  Users,
  Heart,
  Settings,
  Flag,
  FileText,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import useNotification from "../hooks/useNotification";
import NotificationModal from "./NotificationModal"; 

export default function Navbar() {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getUserRole = () => {
    return user?.role || null;
  };

  const isLoggedIn = () => {
    return user !== null;
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    setProfileDropdownOpen(false);
    showNotification("Anda telah berhasil logout", "Logout Berhasil", "success");
    navigate("/");
  };

  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleShoppingCartClick = () => {
    if (!isLoggedIn()) {
      showNotification("Harap login terlebih dahulu", "Akses Ditolak", "warning");
      return;
    }

    if (getUserRole() === "user") {
      navigate("/keranjang");
    } else {
      showNotification("Fitur ini hanya tersedia untuk User", "Akses Ditolak", "warning");
    }
  };

  const handleViewProfile = () => {
    setProfileDropdownOpen(false);
    navigate("/lihat-profil");
  };

  const handleViewLikedEvents = () => {
    setProfileDropdownOpen(false);
    navigate("/event-disukai");
  };

  const handleViewTransactionHistory = () => {
    setProfileDropdownOpen(false);
    navigate("/riwayat-transaksi");
  };

  const handleViewReportIssue = () => {
    setProfileDropdownOpen(false);
    navigate("/laporkan-masalah");
  };

  const handleViewReportIssueAdmin = () => {
    setProfileDropdownOpen(false);
    navigate("/laporanMasalah");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get("search");

    if (searchQuery && searchQuery.trim() !== "") {
      navigate(`/cariEvent/${encodeURIComponent(searchQuery.trim())}`);
      e.target.reset();
      showNotification(`Mencari event: ${searchQuery}`, "Pencarian", "info");
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "user":
        return "User";
      case "organizer":
        return "Organizer";
      case "admin":
        return "Administrator";
      default:
        return "User";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "user":
        return <Users className="w-4 h-4" />;
      case "organizer":
        return <Star className="w-4 h-4" />;
      case "admin":
        return <Crown className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "user":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "organizer":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "admin":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const shouldShowCart = () => {
    return isLoggedIn() && getUserRole() === "user";
  };

  const getNavIcon = (path) => {
    switch (path) {
      case "/":
        return <Home size={18} />;
      case "/cariEvent":
        return <Search size={18} />;
      case "/kalender-event":
        return <CalendarDays size={18} />;
      case "/tiket-saya":
        return <Ticket size={18} />;
      case "/daftar-event":
      case "/event-saya":
        return <Calendar size={18} />;
      case "/verifikasiUser":
      case "/verifikasi-event":
        return <ShieldCheck size={18} />;
      default:
        return null;
    }
  };

  // Fungsi untuk menampilkan avatar user
  const renderUserAvatar = () => {
    if (user?.profile_pict) {
      return (
        <img
          src={user.profile_pict}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      );
    }
    return (
      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
        <User className="w-5 h-5 text-white" />
      </div>
    );
  };

  // Fungsi untuk menampilkan avatar di mobile menu
  const renderMobileUserAvatar = () => {
    if (user?.profile_pict) {
      return (
        <img
          src={user.profile_pict}
          alt={user.username}
          className="w-14 h-14 rounded-full object-cover border-2 border-white/30 shadow-md"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      );
    }
    return (
      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 shadow-md">
        <User className="w-7 h-7 text-white" />
      </div>
    );
  };

  // Fungsi untuk menangani status aktif pada NavLink
  const getNavLinkClass = (isActive, additionalClasses = "") => {
    const baseClasses = "flex items-center space-x-2 px-6 py-3 rounded-t-lg font-medium transition-all relative group";
    const activeClasses = "bg-white text-blue-600 shadow-lg";
    const inactiveClasses = "text-white hover:bg-white/20 hover:shadow-lg";
    
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${additionalClasses}`;
  };

  return (
    <div>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      {/* NAVBAR TOP */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0C8CE9] shadow-lg' : 'bg-[#0C8CE9]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">
            {/* LEFT SIDE - Logo & Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-white hover:text-amber-400 transition-colors"
                onClick={() => setMobileMenuIsOpen(true)}
              >
                <Menu className="w-7 h-7" />
              </button>
              
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-white rounded-lg p-1 shadow-md">
                  <Ticket className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white">
                  TIKERIA
                </span>
              </Link>
            </div>

            {/* SEARCH BAR - Desktop */}
            <div className="hidden md:block flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Cari event, konser, workshop..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/95 border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
                  />
                </div>
              </form>
            </div>

            {/* RIGHT BUTTONS */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              {shouldShowCart() && (
                <button
                  className="relative text-white hover:text-amber-400 transition-colors p-2"
                  onClick={handleShoppingCartClick}
                >
                  <ShoppingCart className="w-6 h-6" />
                </button>
              )}
              
              {isLoggedIn() ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center space-x-3 text-white hover:text-amber-400 transition-colors p-2"
                    onClick={handleProfileClick}
                  >
                    {renderUserAvatar()}
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-sm font-bold">
                        {user?.username}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center space-x-1 mt-1 ${getRoleColor(user?.role)}`}>
                        {getRoleIcon(user?.role)}
                        <span className="font-semibold">{getRoleDisplayName(user?.role)}</span>
                      </span>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-gray-300 bg-gray-200 flex items-center justify-center shadow-sm">
                            {user?.profile_pict ? (
                              <img
                                src={user.profile_pict}
                                alt={user.username}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold text-lg shadow-inner"
                              style={{
                                display: user?.profile_pict ? "none" : "flex",
                              }}
                            >
                              {user?.username?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-bold text-gray-900 truncate">
                              {user.username}
                            </p>
                            <p className={`text-sm px-3 py-1 rounded-full border flex items-center space-x-1 mt-1 w-fit ${getRoleColor(user.role)}`}>
                              {getRoleIcon(user.role)}
                              <span className="font-bold">{getRoleDisplayName(user.role)}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button
                          onClick={handleViewProfile}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-blue-50 rounded-lg transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Lihat Profil</span>
                        </button>
                        
                        {/* Event yang Disukai - Only for User role */}
                        {isLoggedIn() && getUserRole() === "user" && (
                          <button
                            onClick={handleViewLikedEvents}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-pink-50 rounded-lg transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                              <Heart className="w-4 h-4 text-pink-600" />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-pink-600 transition-colors">Event yang Disukai</span>
                          </button>
                        )}
                        
                        {/* Transaction History - Only for User role */}
                        {getUserRole() === "user" && (
                          <button
                            onClick={handleViewTransactionHistory}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-green-50 rounded-lg transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                              <History className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-green-600 transition-colors">Riwayat Transaksi</span>
                          </button>
                        )}

                        {(getUserRole() === "user" || getUserRole() === "organizer") && (
                          <button
                            onClick={handleViewReportIssue}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-yellow-50 rounded-lg transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                              <Flag className="w-4 h-4 text-yellow-600" />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-yellow-600 transition-colors">Laporkan Masalah</span>
                          </button>
                        )}

                        { getUserRole() === "admin" && (
                          <button
                            onClick={handleViewReportIssueAdmin}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-yellow-50 rounded-lg transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                              <FileText className="w-4 h-4 text-yellow-600" />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-yellow-600 transition-colors">Laporan Masalah</span>
                          </button>
                        )}
                        
                        <div className="border-t border-gray-200 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 rounded-lg transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                              <LogOut className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="font-medium text-red-600 group-hover:text-red-700 transition-colors">Keluar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login">
                  <button className="bg-[#044888] shadow-md text-white px-5 py-2.5 rounded-lg font-bold hover:bg-white hover:shadow-lg hover:text-[#044888] transition-all">
                    Masuk
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* NAVBAR BOTTOM - Secondary Nav */}
      <nav className="hidden md:block fixed top-20 w-full z-40 bg-[#044888] shadow-md' : 'bg-[#044888] border-t border-white/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) => getNavLinkClass(isActive)}
            >
              <Home size={16} />
              <span>Beranda</span>
              {/* Hover effect */}
              <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                location.pathname === "/" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`} />
            </NavLink>

            <NavLink
              to="/cariEvent"
              className={({ isActive }) => getNavLinkClass(isActive)}
            >
              <Search size={16} />
              <span>Cari Event</span>
              {/* Hover effect */}
              <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                location.pathname.startsWith("/cariEvent") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`} />
            </NavLink>

            {/* Kalender Event - Accessible by all users */}
            <NavLink
              to="/kalender-event"
              className={({ isActive }) => getNavLinkClass(isActive)}
            >
              <CalendarDays size={16} />
              <span>Kalender Event</span>
              {/* Hover effect */}
              <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                location.pathname === "/kalender-event" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`} />
            </NavLink>

            {/* Menu untuk User */}
            {isLoggedIn() && getUserRole() === "user" && (
              <NavLink
                to="/tiket-saya"
                className={({ isActive }) => getNavLinkClass(isActive)}
              >
                <Ticket size={16} />
                <span>Tiket Saya</span>
                {/* Hover effect */}
                <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                  location.pathname === "/tiket-saya" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`} />
              </NavLink>
            )}

            {/* Menu untuk Organizer */}
            {isLoggedIn() && getUserRole() === "organizer" && (
              <>
                <NavLink
                  to="/daftar-event"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <Calendar size={16} />
                  <span>Buat Event</span>
                  {/* Hover effect */}
                  <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                    location.pathname === "/daftar-event" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`} />
                </NavLink>
                <NavLink
                  to="/event-saya"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <Calendar size={16} />
                  <span>Event Saya</span>
                  {/* Hover effect */}
                  <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                    location.pathname === "/event-saya" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`} />
                </NavLink>
              </>
            )}

            {/* Menu untuk Admin */}
            {isLoggedIn() && getUserRole() === "admin" && (
              <>
                <NavLink
                  to="/verifikasiUser"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <ShieldCheck size={16} />
                  <span>Verifikasi User</span>
                  {/* Hover effect */}
                  <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                    location.pathname === "/verifikasiUser" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`} />
                </NavLink>
                <NavLink
                  to="/verifikasi-event"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <ShieldCheck size={16} />
                  <span>Verifikasi Event</span>
                  {/* Hover effect */}
                  <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                    location.pathname === "/verifikasi-event" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`} />
                </NavLink>
                <NavLink
                  to="/atur-event"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <Settings size={16} />
                  <span>Atur Event</span>
                  {/* Hover effect */}
                  <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 transform origin-left transition-transform ${
                    location.pathname === "/verifikasi-event" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`} />
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE SEARCH BAR */}
      <nav className="fixed md:hidden top-16 w-full z-40 bg-[#0C8CE9] border-b border-white/20 shadow-sm">
        <div className="px-4 py-3">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="search"
                placeholder="Cari event..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/95 border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
              />
            </div>
          </form>
        </div>
      </nav>

      {/* MOBILE SIDE MENU */}
      <div
        className={`${
          mobileMenuIsOpen ? "fixed inset-0" : "hidden"
        } z-50 bg-black/50 transition-all duration-300`}
        onClick={() => setMobileMenuIsOpen(false)}
      >
        <div
          className={`absolute top-0 left-0 w-80 h-full bg-white shadow-xl transform ${
            mobileMenuIsOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Ticket className="w-8 h-8" />
                <span className="text-xl font-bold">TIKERIA</span>
              </div>
              <button
                onClick={() => setMobileMenuIsOpen(false)}
                className="text-white hover:text-amber-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* User Info - Ditampilkan di mobile */}
            {isLoggedIn() ? (
              <div className="flex items-center space-x-3">
                {renderMobileUserAvatar()}
                <div>
                  <p className="font-bold text-lg">{user?.username}</p>
                  <p className={`text-xs px-3 py-1 rounded-full border flex items-center space-x-1 mt-1 w-fit ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    <span className="font-bold">{getRoleDisplayName(user.role)}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-blue-100 mb-3">Belum login?</p>
                <Link to="/login">
                  <button 
                    className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-all"
                    onClick={() => setMobileMenuIsOpen(false)}
                  >
                    Masuk Sekarang
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) => 
                `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                  isActive 
                    ? "bg-blue-50 text-blue-600 font-bold" 
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`
              }
              onClick={() => setMobileMenuIsOpen(false)}
            >
              <Home size={20} />
              <span className="font-semibold">Beranda</span>
            </NavLink>

            <NavLink
              to="/cariEvent"
              className={({ isActive }) => 
                `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                  isActive 
                    ? "bg-blue-50 text-blue-600 font-bold" 
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`
              }
              onClick={() => setMobileMenuIsOpen(false)}
            >
              <Search size={20} />
              <span className="font-semibold">Cari Event</span>
            </NavLink>

            {/* Kalender Event - Accessible by all users (Mobile) */}
            <NavLink
              to="/kalender-event"
              className={({ isActive }) => 
                `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                  isActive 
                    ? "bg-blue-50 text-blue-600 font-bold" 
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`
              }
              onClick={() => setMobileMenuIsOpen(false)}
            >
              <CalendarDays size={20} />
              <span className="font-semibold">Kalender Event</span>
            </NavLink>

            {/* Event yang Disukai - Only for User role (Mobile) */}
            {isLoggedIn() && getUserRole() === "user" && (
              <NavLink
                to="/event-disukai"
                className={({ isActive }) => 
                  `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                    isActive 
                      ? "bg-pink-50 text-pink-600 font-bold" 
                      : "text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                  }`
                }
                onClick={() => setMobileMenuIsOpen(false)}
              >
                <Heart size={20} />
                <span className="font-semibold">Event Disukai</span>
              </NavLink>
            )}

            {/* Menu untuk User */}
            {isLoggedIn() && getUserRole() === "user" && (
              <NavLink
                to="/tiket-saya"
                className={({ isActive }) => 
                  `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                    isActive 
                      ? "bg-blue-50 text-blue-600 font-bold" 
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`
                }
                onClick={() => setMobileMenuIsOpen(false)}
              >
                <Ticket size={20} />
                <span className="font-semibold">Tiket Saya</span>
              </NavLink>
            )}

            {/* Menu untuk Organizer */}
            {isLoggedIn() && getUserRole() === "organizer" && (
              <>
                <NavLink
                  to="/daftar-event"
                  className={({ isActive }) => 
                    `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                      isActive 
                        ? "bg-blue-50 text-blue-600 font-bold" 
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`
                  }
                  onClick={() => setMobileMenuIsOpen(false)}
                >
                  <Calendar size={20} />
                  <span className="font-semibold">Buat Event</span>
                </NavLink>
                <NavLink
                  to="/event-saya"
                  className={({ isActive }) => 
                    `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                      isActive 
                        ? "bg-blue-50 text-blue-600 font-bold" 
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`
                  }
                  onClick={() => setMobileMenuIsOpen(false)}
                >
                  <Calendar size={20} />
                  <span className="font-semibold">Event Saya</span>
                </NavLink>
              </>
            )}

            {/* Menu untuk Admin */}
            {isLoggedIn() && getUserRole() === "admin" && (
              <>
                <NavLink
                  to="/verifikasiUser"
                  className={({ isActive }) => 
                    `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                      isActive 
                        ? "bg-blue-50 text-blue-600 font-bold" 
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`
                  }
                  onClick={() => setMobileMenuIsOpen(false)}
                >
                  <ShieldCheck size={20} />
                  <span className="font-semibold">Verifikasi User</span>
                </NavLink>
                <NavLink
                  to="/verifikasi-event"
                  className={({ isActive }) => 
                    `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                      isActive 
                        ? "bg-blue-50 text-blue-600 font-bold" 
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`
                  }
                  onClick={() => setMobileMenuIsOpen(false)}
                >
                  <ShieldCheck size={20} />
                  <span className="font-semibold">Verifikasi Event</span>
                </NavLink>
                <NavLink
                  to="/atur-event"
                  className={({ isActive }) => 
                    `flex items-center space-x-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                      isActive 
                        ? "bg-blue-50 text-blue-600 font-bold" 
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`
                  }
                  onClick={() => setMobileMenuIsOpen(false)}
                >
                  <Settings size={20} />
                  <span className="font-semibold">Atur Event</span>
                </NavLink>
              </>
            )}

            {/* Logout Button */}
            {isLoggedIn() && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-4 rounded-lg text-red-600 hover:bg-red-50 transition-all mt-4 hover:scale-[1.02]"
              >
                <LogOut size={20} />
                <span className="font-semibold">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}