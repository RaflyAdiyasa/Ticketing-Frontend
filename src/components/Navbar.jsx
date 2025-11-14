
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router"

export default function Navbar() {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);

  return (
    <div>
      {/* NAVBAR TOP */}
      <nav className="fixed top-0 w-full z-40 transition-all duration-300 bg-[#0C8CE9]">
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
              <form action="">
                <input
                  type="text"
                  placeholder="Cari Event berdasarkan nama"
                  className="shrink hidden md:block md:w-80 lg:w-150 xl:190 rounded-lg px-4 py-2 mx-3 bg-white"
                />
                <button className="absolute hidden md:block inset-y-0 right-3 items-center px-4 text-white bg-[#0C8CE9] border-white border rounded-r-md hover:bg-amber-400 cursor-pointer focus:outline-none">
                  <Search className="w-6 h-6" />
                </button>
              </form>
            </div>

            {/* RIGHT BUTTONS */}
            <div className="flex items-center space-x-4 lg:space-x-6">
              <button className="text-white hover:text-amber-400 cursor-pointer">
                <ShoppingCart className="w-8 h-8 md:w-9 md:h-9" />
              </button>
              <Link to="/login">
                <button className="w-22 md:w-24 text-sm md:text-base bg-[#044888] text-white py-2 rounded-lg hover:bg-amber-400 font-semibold cursor-pointer transition-all ">
                  Masuk
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* NAVBAR BOTTOM (DESKTOP ONLY) */}
      <nav className="fixed hidden md:block sm:top-18 md:top-20 w-full z-40 transition-all duration-10 bg-[#044888]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center bg-[#044888]">
            <NavLink
              to="/cariEvent"
              className={({ isActive }) =>
                isActive ? "bg-[#0C8CE9] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white" : "bg-[#044888] text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
              }

              >
              Cari Event
            </NavLink>
            <a
              href="#"
              className="text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
            >
              Event Populer
            </a>
            <a
              href="#"
              className="text-lg hover:bg-[#0C8CE9] py-1.5 px-2 font-semibold text-white"
            >
              Menu wahaha
            </a>
          </div>
        </div>
      </nav>

      {/* NAVBAR BOTTOM (Mobile ONLY) */}
      <nav className="fixed md:hidden top-16 sm:top-18 w-full z-40 transition-all duration-10 bg-[#0C8CE9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="items-center h-18 bg-[#0C8CE9]">

            {/* SearchBar (Mobile ONLY) */}
            <div className="relative">
              <form action="">
                <input
                  type="text"
                  placeholder="Cari Event berdasarkan nama"
                  className="shrink w-full rounded-lg px-4 py-2 my-3 bg-white"
                />
                <button className="absolute inset-y-0 right-0 items-center px-4 my-3 text-white bg-[#0C8CE9] border-white border rounded-r-md hover:bg-amber-400 cursor-pointer focus:outline-none">
                  <Search className="w-6 h-6" />
                </button>
              </form>
            </div>


          </div>
        </div>
      </nav>

      {/* DRAWER SIDE MENU */}

      <div
        className={`${mobileMenuIsOpen
            ? "fixed inset-0 opacity-100"
            : "opacity-0 max-h-0 max-w-0"
          } z-50 transition-opacity bg-black/50 duration-300 `}
        onClick={() => setMobileMenuIsOpen(false)}
      >
        <div
          className={`${mobileMenuIsOpen ? "animate-slideIn" : "animate-slideOut"
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
          >
            Cari Event
          </NavLink>
          <a
            href="#"
            className="text-white text-lg font-semibold mb-4 hover:text-[#0C8CE9]"
          >
            Event Populer
          </a>
          <a
            href="#"
            className="text-white text-lg font-semibold mb-4 hover:text-[#0C8CE9]"
          >
            Menu wahaha
          </a>
        </div>
      </div>
    </div>
  );
}
