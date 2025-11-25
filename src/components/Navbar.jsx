import {
  Menu,
  Search,
  ShoppingCart,
  X,
  History,
  CircleUser,
  LogOut,
  User,
  Home,
  Ticket,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router";
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

  const handleViewTransactionHistory = () => {
    setProfileDropdownOpen(false);
    navigate("/riwayat-transaksi");
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
        return "Event Organizer";
      case "admin":
        return "Administrator";
      default:
        return "User";
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
          className="w-10 h-10 rounded-full object-cover border-2 border-white"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      );
    }
    return (
      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white">
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
          className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      );
    }
    return (
      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
        <User className="w-7 h-7 text-white" />
      </div>
    );
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
                <div className="bg-white rounded-lg p-1">
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
                    placeholder="Cari event berdasarkan nama..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/95 border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
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
                      <span className="text-sm font-medium">
                        {user?.username}
                      </span>
                      <span className="text-xs text-white/80 capitalize bg-white/20 px-2 py-0.5 rounded-full">
                        {getRoleDisplayName(user?.role)}
                      </span>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-gray-300 bg-gray-200 flex items-center justify-center">
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
                              className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-semibold text-lg"
                              style={{
                                display: user?.profile_pict ? "none" : "flex",
                              }}
                            >
                              {user?.username?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.username}
                            </p>
                            <p className="text-xs text-gray-600 capitalize bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full inline-block mt-1">
                              {getRoleDisplayName(user.role)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button
                          onClick={handleViewProfile}
                          className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <User className="w-5 h-5" />
                          <span>Lihat Profil</span>
                        </button>

                        {isLoggedIn() && getUserRole() === "user" && (
                          <button
                            onClick={handleViewTransactionHistory}
                            className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <History className="w-5 h-5" />
                            <span>Riwayat Pembelian</span>
                          </button>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all mt-2"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Keluar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login">
                  <button className="bg-white text-blue-600 px-7 py-3 rounded-lg hover:bg-blue-50 font-semibold transition-all shadow-sm text-sm">
                    Masuk
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* NAVBAR BOTTOM (DESKTOP ONLY) */}
      <nav className={`fixed hidden md:block top-20 w-full z-40 transition-all duration-300 ${
        scrolled ? 'bg-[#044888] shadow-md' : 'bg-[#044888]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all ${
                  isActive
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-white hover:bg-white/10"
                }`
              }
            >
              <Home size={16} />
              <span>Beranda</span>
            </NavLink>

            <NavLink
              to="/cariEvent"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all ${
                  isActive
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-white hover:bg-white/10"
                }`
              }
            >
              <Search size={16} />
              <span>Cari Event</span>
            </NavLink>

            {/* Menu untuk User */}
            {isLoggedIn() && getUserRole() === "user" && (
              <NavLink
                to="/tiket-saya"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-white hover:bg-white/10"
                  }`
                }
              >
                <Ticket size={16} />
                <span>Tiket Saya</span>
              </NavLink>
            )}

            {/* Menu untuk Organizer */}
            {isLoggedIn() && getUserRole() === "organizer" && (
              <>
                <NavLink
                  to="/daftar-event"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all ${
                      isActive
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  <Calendar size={16} />
                  <span>Buat Event</span>
                </NavLink>
                <NavLink
                  to="/event-saya"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all ${
                      isActive
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  <Calendar size={16} />
                  <span>Event Saya</span>
                </NavLink>
              </>
            )}

            {/* Menu untuk Admin */}
            {isLoggedIn() && getUserRole() === "admin" && (
              <>
                <NavLink
                  to="/verifikasiUser"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all ${
                      isActive
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  <ShieldCheck size={16} />
                  <span>Verifikasi User</span>
                </NavLink>
                <NavLink
                  to="/verifikasi-event"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all ${
                      isActive
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  <ShieldCheck size={16} />
                  <span>Verifikasi Event</span>
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE SEARCH BAR */}
      <nav className="fixed md:hidden top-16 w-full z-40 bg-[#0C8CE9] border-b border-white/20">
        <div className="px-4 py-3">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="search"
                placeholder="Cari event..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/95 border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
            
            {isLoggedIn() && (
              <div className="flex items-center space-x-3">
                {renderMobileUserAvatar()}
                <div>
                  <p className="font-semibold">{user?.username}</p>
                  <p className="text-xs text-blue-100 capitalize bg-white/20 px-2 py-0.5 rounded-full mt-1">
                    {getRoleDisplayName(user.role)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-2">
            <NavLink
              to="/"
              className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
              onClick={() => setMobileMenuIsOpen(false)}
            >
              <Home size={20} />
              <span className="font-medium">Beranda</span>
            </NavLink>

            <NavLink
              to="/cariEvent"
              className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
              onClick={() => setMobileMenuIsOpen(false)}
            >
              <Search size={20} />
              <span className="font-medium">Cari Event</span>
            </NavLink>

            {/* Menu untuk User */}
            {isLoggedIn() && getUserRole() === "user" && (
              <NavLink
                to="/tiket-saya"
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                onClick={() => setMobileMenuIsOpen(false)}
              >
                <Ticket size={20} />
                <span className="font-medium">Tiket Saya</span>
              </NavLink>
            )}

            {/* Menu untuk Organizer */}
            {isLoggedIn() && getUserRole() === "organizer" && (
              <>
                <NavLink
                  to="/daftar-event"
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  onClick={() => setMobileMenuIsOpen(false)}
                >
                  <Calendar size={20} />
                  <span className="font-medium">Buat Event</span>
                </NavLink>
                <NavLink
                  to="/event-saya"
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  onClick={() => setMobileMenuIsOpen(false)}
                >
                  <Calendar size={20} />
                  <span className="font-medium">Event Saya</span>
                </NavLink>
              </>
            )}

            {/* Menu untuk Admin */}
            {isLoggedIn() && getUserRole() === "admin" && (
              <>
                <NavLink
                  to="/verifikasiUser"
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  onClick={() => setMobileMenuIsOpen(false)}
                >
                  <ShieldCheck size={20} />
                  <span className="font-medium">Verifikasi User</span>
                </NavLink>
                <NavLink
                  to="/verifikasi-event"
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  onClick={() => setMobileMenuIsOpen(false)}
                >
                  <ShieldCheck size={20} />
                  <span className="font-medium">Verifikasi Event</span>
                </NavLink>
              </>
            )}

            {/* Logout Button */}
            {isLoggedIn() && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-all mt-4"
              >
                <LogOut size={20} />
                <span className="font-medium">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}