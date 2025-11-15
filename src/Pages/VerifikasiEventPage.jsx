import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";

export default function VerifikasiEvent() {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">

            <h2 className="text-2xl font-bold mb-4">Ini adalah halaman Verifikasi Event</h2>
            <p className="text-gray-600">Halaman ini hanya dapat diakses oleh user dengan role "admin".</p>

        </div>
      </div>
    </div>
  );
}