import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";

export default function TiketSaya() {
  const navigate = useNavigate();
  const [expandedTickets, setExpandedTickets] = useState({});
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Format tanggal untuk display
  const formatDateRange = (startDate, endDate) => {
    if (startDate === endDate) {
      return startDate;
    }
    return `${startDate} - ${endDate}`;
  };

  // Data tiket dummy dengan struktur baru
  const tickets = [
    {
      id: 1,
      eventName: "Arima Kinen",
      address: "Jalan Inkan Baya Blok I no.5, Pondok Timur Indah, Mustika Jaya, Kota Bekasi, Jawa Barat",
      startDate: "29 Nov 2025",
      endDate: "30 Nov 2025",
      details: [
        { 
          type: "Dewasa", 
          description: "Untuk usia 20 ke atas", 
          price: "Rp 100.000,-",
          startDate: "29 Nov 2025",
          endDate: "29 Nov 2025",
          ticketId: "TKT-DEW-001",
          qrCode: "QR-DEWASA-001" 
        },
        { 
          type: "Anak-Anak", 
          description: "Untuk usia 5-12 tahun", 
          price: "Rp 50.000,-",
          startDate: "30 Nov 2025",
          endDate: "30 Nov 2025",
          ticketId: "TKT-ANK-001",
          qrCode: "QR-ANAK-001" 
        },
        { 
          type: "3 Days Pass", 
          description: "Akses 3 hari penuh", 
          price: "Rp 250.000,-",
          startDate: "29 Nov 2025",
          endDate: "01 Des 2025",
          ticketId: "TKT-3DP-001",
          qrCode: "QR-3DAYS-001" 
        }
      ]
    },
    {
      id: 2,
      eventName: "NHK Mile",
      address: "Jalan Inkan Baya Blok I no.5, Pondok Timur Indah, Mustika Jaya, Kota Bekasi, Jawa Barat",
      startDate: "15 Des 2025",
      endDate: "15 Des 2025", // Event 1 hari
      details: [
        { 
          type: "VIP", 
          description: "Tempat duduk VIP dengan fasilitas lengkap", 
          price: "Rp 200.000,-",
          startDate: "15 Des 2025",
          endDate: "15 Des 2025",
          ticketId: "TKT-VIP-002",
          qrCode: "QR-VIP-002" 
        },
        { 
          type: "Reguler", 
          description: "Tempat duduk reguler", 
          price: "Rp 100.000,-",
          startDate: "15 Des 2025",
          endDate: "15 Des 2025",
          ticketId: "TKT-REG-002",
          qrCode: "QR-REG-002" 
        }
      ]
    },
    {
      id: 3,
      eventName: "Breeder Cup",
      address: "Jalan Inkan Baya Blok I no.5, Pondok Timur Indah, Mustika Jaya, Kota Bekasi, Jawa Barat",
      startDate: "20 Jan 2026",
      endDate: "22 Jan 2026",
      details: [
        { 
          type: "Weekend Pass", 
          description: "Akses weekend saja", 
          price: "Rp 180.000,-",
          startDate: "21 Jan 2026",
          endDate: "22 Jan 2026",
          ticketId: "TKT-WKP-003",
          qrCode: "QR-WKP-003" 
        }
      ]
    }
  ];

  // Fungsi untuk toggle dropdown
  const toggleDropdown = (ticketId) => {
    setExpandedTickets(prev => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  // Fungsi untuk menampilkan QR Code dan detail tiket
  const handleShowQR = (ticket, detail) => {
    setSelectedTicket({
      event: ticket,
      detail: detail
    });
    setShowQRDialog(true);
  };

  // Fungsi untuk menutup dialog QR
  const handleCloseQR = () => {
    setShowQRDialog(false);
    setSelectedTicket(null);
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 bg-white shadow-xl rounded-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tiket Saya</h1>
          </div>

          {/* Daftar Tiket */}
          <div className="space-y-4 pb-8">
            {tickets.map((ticket, index) => (
              <div key={ticket.id} className="border border-gray-300 rounded-lg p-4 bg-white">
                
                {/* Header Event dengan Tombol Rincian */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">{ticket.eventName}</h2>
                    <p className="text-gray-600 text-xs mt-1">{ticket.address}</p>
                    <div className="flex items-center gap-1 text-gray-600 text-xs mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDateRange(ticket.startDate, ticket.endDate)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDropdown(ticket.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <span>Rincian</span>
                    <svg
                      className={`w-4 h-4 transform transition-transform ${
                        expandedTickets[ticket.id] ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Dropdown Content */}
                {expandedTickets[ticket.id] && ticket.details.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    {/* Detail Tiket */}
                    <div className="space-y-3">
                      {ticket.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm">{detail.type}</h4>
                              <div className="flex items-center gap-1 text-gray-600 text-xs mt-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{formatDateRange(detail.startDate, detail.endDate)}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleShowQR(ticket, detail)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap ml-4"
                            >
                              Tampilkan QR
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-gray-600 text-xs">
                              Keterangan: {detail.description}
                            </p>
                            <p className="font-bold text-gray-900 text-sm">{detail.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Jika tidak ada details tapi dropdown dibuka */}
                {expandedTickets[ticket.id] && ticket.details.length === 0 && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <p className="text-gray-500 text-sm text-center">Tidak ada detail tiket tersedia.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dialog QR Code & Detail Tiket */}
      {showQRDialog && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {selectedTicket.event.eventName}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{selectedTicket.detail.type}</p>
              
              {/* QR Code Placeholder */}
              <div className="bg-gray-200 w-48 h-48 mx-auto flex items-center justify-center rounded-lg mb-4">
                <span className="text-gray-500 text-sm">QR Code: {selectedTicket.detail.qrCode}</span>
              </div>
              <p className="text-gray-500 text-xs mb-4">
                Tunjukkan QR code ini saat masuk venue
              </p>
              
              {/* Detail Tiket */}
              <div className="text-left space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Ticket ID:</span>
                  <span className="font-semibold text-sm">{selectedTicket.detail.ticketId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Harga:</span>
                  <span className="font-semibold text-sm">{selectedTicket.detail.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Tanggal:</span>
                  <span className="font-semibold text-sm">
                    {formatDateRange(selectedTicket.detail.startDate, selectedTicket.detail.endDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Alamat:</span>
                  <span className="font-semibold text-sm text-right max-w-[200px]">
                    {selectedTicket.event.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Keterangan:</span>
                  <span className="font-semibold text-sm text-right max-w-[200px]">
                    {selectedTicket.detail.description}
                  </span>
                </div>
              </div>
              
              
              
              <button
                onClick={handleCloseQR}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}