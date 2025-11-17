import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import QRCodeGenerator from "../components/QRCodeGenerator";
import { ticketAPI } from "../services/api";

export default function TiketSaya() {
  const navigate = useNavigate();
  const [expandedTickets, setExpandedTickets] = useState({});
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tickets data from API
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketAPI.getTickets();
      setTickets(response.data || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Gagal memuat tiket");
    } finally {
      setLoading(false);
    }
  };

  // Fetch ticket code for QR generation
  const fetchTicketCode = async (ticketId) => {
    try {
      const response = await ticketAPI.getTicketCode(ticketId);
      return response.data.ticket;
    } catch (err) {
      console.error("Error fetching ticket code:", err);
      throw err;
    }
  };

  // Format tanggal untuk display
  const formatDateRange = (startDate, endDate) => {
    if (startDate === endDate) {
      return startDate;
    }
    return `${startDate} - ${endDate}`;
  };

  // Format date from API response
  const formatAPIDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time from API response
  const formatAPITime = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Process API data to match frontend structure - DIPERBARUI
  const processTicketData = (apiTickets) => {
    const groupedTickets = {};
    
    apiTickets.forEach(ticket => {
      const eventId = ticket.event?.name || "unknown"; // Use event name as group key
      
      if (!groupedTickets[eventId]) {
        groupedTickets[eventId] = {
          id: eventId,
          eventName: ticket.event?.name || "Event",
          address: `${ticket.event?.location || ''}, ${ticket.event?.city || ''}`.trim() || "Alamat tidak tersedia",
          // Gunakan event date untuk header event
          startDate: formatAPIDate(ticket.event?.date_start),
          endDate: formatAPIDate(ticket.event?.date_end),
          details: []
        };
      }

      // Add ticket detail - gunakan ticket category date untuk detail tiket
      groupedTickets[eventId].details.push({
        type: ticket.ticket_category?.name || "Tiket", // Gunakan ticket category name
        description: ticket.ticket_category?.description || "Tiket masuk event",
        price: formatRupiah(ticket.ticket_category?.price || 0),
        // Gunakan ticket category date untuk detail tiket
        startDate: formatAPIDate(ticket.ticket_category?.date_time_start),
        endDate: formatAPIDate(ticket.ticket_category?.date_time_end),
        timeRange: `${formatAPITime(ticket.ticket_category?.date_time_start)} - ${formatAPITime(ticket.ticket_category?.date_time_end)}`,
        ticketId: ticket.ticket_id,
        qrCode: ticket.code,
        status: "active", // Default status since API doesn't provide status
        rawData: ticket
      });
    });

    return Object.values(groupedTickets);
  };

  // Fungsi untuk toggle dropdown
  const toggleDropdown = (ticketId) => {
    setExpandedTickets(prev => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  // Fungsi untuk menampilkan QR Code dan detail tiket
  const handleShowQR = async (ticket, detail) => {
    try {
      // Fetch latest ticket code
      const ticketData = await fetchTicketCode(detail.ticketId);
      
      setSelectedTicket({
        event: {
          eventName: ticketData.event?.name || "Event",
          address: `${ticketData.event?.location || ''}, ${ticketData.event?.city || ''}`.trim() || "Alamat tidak tersedia",
          // Tambahkan event date untuk dialog
          eventDate: formatDateRange(
            formatAPIDate(ticketData.event?.date_start),
            formatAPIDate(ticketData.event?.date_end)
          )
        },
        detail: {
          ...detail,
          qrCode: ticketData.code,
          ticketId: ticketData.ticket_id,
          price: formatRupiah(ticketData.ticket_category?.price || 0),
          // Gunakan ticket category name
          type: ticketData.ticket_category?.name || "Tiket",
          // Gunakan ticket category date untuk detail
          startDate: formatAPIDate(ticketData.ticket_category?.date_time_start),
          endDate: formatAPIDate(ticketData.ticket_category?.date_time_end),
          description: ticketData.ticket_category?.description || "Tiket masuk event",
          timeRange: `${formatAPITime(ticketData.ticket_category?.date_time_start)} - ${formatAPITime(ticketData.ticket_category?.date_time_end)}`
        }
      });
      setShowQRDialog(true);
    } catch (err) {
      console.error("Error showing QR:", err);
      // Fallback to existing data if API fails
      setSelectedTicket({
        event: {
          ...ticket,
          eventDate: formatDateRange(ticket.startDate, ticket.endDate)
        },
        detail: detail
      });
      setShowQRDialog(true);
    }
  };

  // Fungsi untuk menutup dialog QR
  const handleCloseQR = () => {
    setShowQRDialog(false);
    setSelectedTicket(null);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat tiket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={fetchTickets} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const processedTickets = processTicketData(tickets);

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 bg-white shadow-xl rounded-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tiket Saya</h1>
            <p className="text-gray-600 mt-2">
              {processedTickets.length > 0 
                ? `Total ${tickets.length} tiket aktif` 
                : 'Belum ada tiket aktif'}
            </p>
          </div>

          {/* Daftar Tiket */}
          <div className="space-y-4 pb-8">
            {processedTickets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Anda belum memiliki tiket aktif.</p>
                <button 
                  onClick={() => navigate('/events')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Jelajahi Event
                </button>
              </div>
            ) : (
              processedTickets.map((ticket, index) => (
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
                        {/* Tampilkan event date range di header */}
                        <span>Event: {formatDateRange(ticket.startDate, ticket.endDate)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleDropdown(ticket.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <span>{expandedTickets[ticket.id] ? 'Sembunyikan' : 'Rincian'}</span>
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
                                {/* Tampilkan ticket category name */}
                                <h4 className="font-semibold text-gray-900 text-sm">{detail.type}</h4>
                                <div className="flex items-center gap-1 text-gray-600 text-xs mt-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {/* Tampilkan ticket category date range di detail */}
                                  <span>Tanggal Tiket: {formatDateRange(detail.startDate, detail.endDate)}</span>
                                </div>
                                {/* {detail.timeRange && (
                                  <div className="flex items-center gap-1 text-gray-600 text-xs mt-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Waktu: {detail.timeRange}</span>
                                  </div>
                                )} */}
                                <div className="mt-1">
                                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                    Aktif
                                  </span>
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
                            <div className="mt-2 text-xs text-gray-500">
                              Ticket ID: {detail.ticketId}
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
              ))
            )}
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
              {/* Tampilkan ticket category name di dialog */}
              <p className="text-gray-600 text-sm mb-4">{selectedTicket.detail.type}</p>
              
              {/* QR Code Generator */}
              <div className="flex justify-center mb-4">
                <QRCodeGenerator 
                  value={selectedTicket.detail.qrCode}
                  size={200}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#000000"
                  includeMargin={true}
                />
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
                  <span className="text-gray-600 text-sm">Jenis Tiket:</span>
                  <span className="font-semibold text-sm">{selectedTicket.detail.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Harga:</span>
                  <span className="font-semibold text-sm">{selectedTicket.detail.price}</span>
                </div>
                {/* Tampilkan Event Date */}
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Tanggal Event:</span>
                  <span className="font-semibold text-sm">
                    {selectedTicket.event.eventDate}
                  </span>
                </div>
                {/* Tampilkan Ticket Date */}
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Tanggal Tiket:</span>
                  <span className="font-semibold text-sm">
                    {formatDateRange(selectedTicket.detail.startDate, selectedTicket.detail.endDate)}
                  </span>
                </div>
                {/* {selectedTicket.detail.timeRange && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Waktu:</span>
                    <span className="font-semibold text-sm">{selectedTicket.detail.timeRange}</span>
                  </div>
                )} */}
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