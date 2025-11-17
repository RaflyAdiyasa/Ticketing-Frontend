// Pages/CheckinTiket.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";


export default function CheckinTiket() {
  const { eventId } = useParams();
  const navigate = useNavigate();
 

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Scan Tiket - Event {eventId}
            </h1>
            <p className="text-gray-600">
              Arahkan kamera ke QR code pada tiket untuk check-in
            </p>
          </div>

        
        </div>
      </div>
    </div>
  );
}