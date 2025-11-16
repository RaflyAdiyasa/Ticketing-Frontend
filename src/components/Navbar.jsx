import {
  Menu,
  Search,
  ShoppingCart,
  X,
  History,
  CircleUser,
  LogOut,
  User,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import useNotification from "../hooks/useNotification"; // Sesuaikan path
import NotificationModal from "./NotificationModal"; // Sesuaikan path

export default function Navbar() {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Gunakan hook useNotification
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    // Get user data from sessionStorage
    const userData = sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
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
    // Clear session storage
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Reset state
    setUser(null);
    setProfileDropdownOpen(false);

    // Show notification
    showNotification("Anda telah berhasil logout", "Logout Berhasil", "success");

    // Navigate to landing page
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

  // Search handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get("search");

    if (searchQuery && searchQuery.trim() !== "") {
      navigate(`/cariEvent/${encodeURIComponent(searchQuery.trim())}`);
      // Clear form setelah submit
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

  return (
    <div>
      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      {/* NAVBAR TOP */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-[#0C8CE9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">
            {/* LEFT SIDE */}
            <div className="flex items-center">
              {/* Drawer Button Mobile */}
              <div className="flex items-center m-0 p-0 md:hidden">
                <button
                  className="mx-3 text-white hover:text-amber-400 cursor-pointer"
                  onClick={() => setMobileMenuIsOpen(true)}
                >
                  <Menu className="w-8 h-8" />
                </button>
              </div>
              <Link to="/">
                <span className="text-xl sm:text-2xl md:text-3xl py-7 font-semibold cursor-pointer">
                  <span className="text-white">TIKE</span>
                  <span className="text-white">RIA.COM</span>
                </span>
              </Link>
            </div>

            {/* SEARCH BAR */}
            <div className="relative">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  name="search"
                  placeholder="Cari Event berdasarkan nama"
                  className="shrink hidden md:block md:w-80 lg:w-150 xl:190 rounded-lg px-4 py-2 mx-3 bg-white"
                />
                <button
                  type="submit"
                  className="absolute hidden md:block inset-y-0 right-3 items-center px-4 text-white bg-[#0C8CE9] border-white border rounded-r-md hover:bg-amber-400 cursor-pointer focus:outline-none"
                >
                  <Search className="w-6 h-6" />
                </button>
              </form>
            </div>

            {/* RIGHT BUTTONS */}
            <div className="flex items-center space-x-4 lg:space-x-6">
              <button
                className="text-white hover:text-amber-400 cursor-pointer flex items-center justify-center"
                onClick={handleShoppingCartClick}
              >
                <ShoppingCart className="w-7 h-7 md:w-8 md:h-8" />
              </button>
              {isLoggedIn() ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="text-white hover:text-amber-400 cursor-pointer transition-all flex items-center justify-center"
                    onClick={handleProfileClick}
                  >
                    <CircleUser className="w-7 h-7 md:w-8 md:h-8" />
                  </button>

                  {/* Profile Dropdown - POSITION ABSOLUTE dengan container relative */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-60">
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#0C8CE9] rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.username}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {getRoleDisplayName(user.role)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button
                          onClick={handleViewProfile}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-all"
                        >
                          <User className="w-4 h-4" />
                          <span>Lihat Profil</span>
                        </button>

                        {isLoggedIn() && getUserRole() === "user" && (
                          <button
                            onClick={handleViewTransactionHistory}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-all"
                          >
                            <History className="w-4 h-4" />
                            <span>Riwayat Pembelian</span>
                          </button>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Keluar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login">
                  <button className="w-22 md:w-24 text-sm md:text-base bg-[#044888] text-white py-2 rounded-lg hover:bg-amber-400 font-semibold cursor-pointer transition-all ">
                    Masuk
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* NAVBAR BOTTOM (DESKTOP ONLY) */}
      <nav className="fixed hidden md:block sm:top-18 md:top-20 w-full z-40 transition-all duration-10 bg-[#044888]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center bg-[#044888]">
            <NavLink
              to="/"
              state={{ scrollToPopular: true }}
              className={({ isActive }) =>
                isActive
                  ? "bg-[#0C8CE9] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
                  : "bg-[#044888] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
              }
            >
              Beranda
            </NavLink>

            <NavLink
              to="/cariEvent"
              className={({ isActive }) =>
                isActive
                  ? "bg-[#0C8CE9] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
                  : "bg-[#044888] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
              }
            >
              Cari Event
            </NavLink>

            {/* Menu untuk User - HANYA muncul jika login DAN role user */}
            {isLoggedIn() && getUserRole() === "user" && (
              <NavLink
                to="/tiket-saya"
                className={({ isActive }) =>
                  isActive
                    ? "bg-[#0C8CE9] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
                    : "bg-[#044888] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
                }
              >
                Tiket Saya
              </NavLink>
            )}

            {/* Menu untuk Organizer - HANYA muncul jika login DAN role organizer */}
            {isLoggedIn() && getUserRole() === "organizer" && (
              <NavLink
                to="/daftar-event"
                className={({ isActive }) =>
                  isActive
                    ? "bg-[#0C8CE9] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
                    : "bg-[#044888] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
                }
              >
                Buat Event
              </NavLink>
            )}

            {/* Menu untuk Organizer - HANYA muncul jika login DAN role organizer */}
            {isLoggedIn() && getUserRole() === "organizer" && (
              <NavLink
                to="/event-saya"
                className={({ isActive }) =>
                  isActive
                    ? "bg-[#0C8CE9] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
                    : "bg-[#044888] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
                }
              >
                Event Saya
              </NavLink>
            )}

            {/* Menu untuk Admin - HANYA muncul jika login DAN role admin */}
            {isLoggedIn() && getUserRole() === "admin" && (
              <NavLink
                to="/verifikasiUser"
                className={({ isActive }) =>
                  isActive
                    ? "bg-[#0C8CE9] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
                    : "bg-[#044888] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
                }
              >
                Verifikasi User
              </NavLink>
            )}
            {isLoggedIn() && getUserRole() === "admin" && (
              <NavLink
                to="/verifikasi-event"
                className={({ isActive }) =>
                  isActive
                    ? "bg-[#0C8CE9] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
                    : "bg-[#044888] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
                }
              >
                Verifikasi Event
              </NavLink>
            )}
          </div>
        </div>
      </nav>

      {/* NAVBAR BOTTOM (Mobile ONLY) */}
      <nav className="fixed md:hidden top-16 sm:top-18 w-full z-40 transition-all duration-10 bg-[#0C8CE9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="items-center h-18 bg-[#0C8CE9]">
            {/* SearchBar (Mobile ONLY) */}
            <div className="relative">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  name="search"
                  placeholder="Cari Event berdasarkan nama"
                  className="shrink w-full rounded-lg px-4 py-2 my-3 bg-white"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 items-center px-4 my-3 text-white bg-[#0C8CE9] border-white border rounded-r-md hover:bg-amber-400 cursor-pointer focus:outline-none"
                >
                  <Search className="w-6 h-6" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* DRAWER SIDE MENU */}
      <div
        className={`${
          mobileMenuIsOpen ? "fixed inset-0 drawer-visible" : "drawer-hidden"
        } z-50 transition-all duration-300 bg-black/50`}
        onClick={() => setMobileMenuIsOpen(false)}
      >
        <div
          className={`${
            mobileMenuIsOpen ? "animate-slideIn" : "animate-slideOut"
          } absolute top-0 left-0 w-75 z-50 h-full bg-[#044888] shadow-xl p-6 flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLOSE BUTTON */}
          <button
            className="self-end mb-6 text-white hover:text-[#0C8CE9] cursor-pointer"
            onClick={() => setMobileMenuIsOpen(false)}
          >
            <X className="w-7 h-7" />
          </button>

          {/* NAV ITEMS */}
          <NavLink
            to="/cariEvent"
            className="text-white text-lg font-semibold mb-4 hover:text-[#0C8CE9]"
            onClick={() => setMobileMenuIsOpen(false)}
          >
            Cari Event
          </NavLink>

          {/* Menu untuk User - HANYA muncul jika login DAN role user */}
          {isLoggedIn() && getUserRole() === "user" && (
            <NavLink
              to="/tiket-saya"
              className="text-white text-lg font-semibold mb-4 hover:text-[#0C8CE9]"
              onClick={() => setMobileMenuIsOpen(false)}
            >
              Tiket Saya
            </NavLink>
          )}

          {/* Menu untuk Organizer - HANYA muncul jika login DAN role organizer */}
          {isLoggedIn() && getUserRole() === "organizer" && (
            <NavLink
              to="/daftar-event"
              className="text-white text-lg font-semibold mb-4 hover:text-[#0C8CE9]"
              onClick={() => setMobileMenuIsOpen(false)}
            >
              Buat Event
            </NavLink>
          )}

          {/* Menu untuk Organizer - HANYA muncul jika login DAN role organizer */}
          {isLoggedIn() && getUserRole() === "organizer" && (
            <NavLink
              to="/event-saya"
              className="text-white text-lg font-semibold mb-4 hover:text-[#0C8CE9]"
              onClick={() => setMobileMenuIsOpen(false)}
            >
              Event Saya
            </NavLink>
          )}

          {/* Menu untuk Admin - HANYA muncul jika login DAN role admin */}
          {isLoggedIn() && getUserRole() === "admin" && (
            <NavLink
              to="/verifikasiUser"
              className="text-white text-lg font-semibold mb-4 hover:text-[#0C8CE9]"
              onClick={() => setMobileMenuIsOpen(false)}
            >
              Verifikasi User
            </NavLink>
          )}
          {isLoggedIn() && getUserRole() === "admin" && (
            <NavLink
              to="/verifikasi-event"
              className="text-white text-lg font-semibold mb-4 hover:text-[#0C8CE9]"
              onClick={() => setMobileMenuIsOpen(false)}
            >
              Verifikasi Event
            </NavLink>
          )}

          <NavLink
            to="/"
            state={{ scrollToPopular: true }}
            className="text-white text-lg font-semibold mb-4 hover:text-[#0C8CE9]"
            onClick={() => setMobileMenuIsOpen(false)}
          >
            Event Populer
          </NavLink>
        </div>
      </div>
    </div>
  );
}