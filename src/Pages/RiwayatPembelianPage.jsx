import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";

export default function RiwayatTransaksi() {
  const navigate = useNavigate();
  const [expandedTransactions, setExpandedTransactions] = useState({});
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Format tanggal untuk display
  const formatDateRange = (startDate, endDate) => {
    if (startDate === endDate) {
      return startDate;
    }
    return `${startDate} - ${endDate}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Data transaksi dummy dengan struktur yang sesuai
  const transactions = [
    {
      transactionId: "TRX-001",
      transactionDate: "25 Nov 2025",
      totalAmount: 400000,
      status: "Berhasil",
      events: [
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
              price: 100000,
              startDate: "29 Nov 2025",
              endDate: "29 Nov 2025",
              ticketId: "TKT-DEW-001",
              qrCode: "QR-DEWASA-001",
              quantity: 2
            },
            { 
              type: "Anak-Anak", 
              description: "Untuk usia 5-12 tahun", 
              price: 50000,
              startDate: "30 Nov 2025",
              endDate: "30 Nov 2025",
              ticketId: "TKT-ANK-001",
              qrCode: "QR-ANAK-001",
              quantity: 1
            }
          ]
        }
      ]
    },
    {
      transactionId: "TRX-002",
      transactionDate: "26 Nov 2025",
      totalAmount: 200000,
      status: "Berhasil",
      events: [
        {
          id: 2,
          eventName: "NHK Mile",
          address: "Jalan Inkan Baya Blok I no.5, Pondok Timur Indah, Mustika Jaya, Kota Bekasi, Jawa Barat",
          startDate: "15 Des 2025",
          endDate: "15 Des 2025",
          details: [
            { 
              type: "VIP", 
              description: "Tempat duduk VIP dengan fasilitas lengkap", 
              price: 200000,
              startDate: "15 Des 2025",
              endDate: "15 Des 2025",
              ticketId: "TKT-VIP-002",
              qrCode: "QR-VIP-002",
              quantity: 1
            }
          ]
        }
      ]
    },
    {
      transactionId: "TRX-003",
      transactionDate: "27 Nov 2025",
      totalAmount: 430000,
      status: "Berhasil",
      events: [
        {
          id: 1,
          eventName: "Arima Kinen",
          address: "Jalan Inkan Baya Blok I no.5, Pondok Timur Indah, Mustika Jaya, Kota Bekasi, Jawa Barat",
          startDate: "29 Nov 2025",
          endDate: "30 Nov 2025",
          details: [
            { 
              type: "3 Days Pass", 
              description: "Akses 3 hari penuh", 
              price: 250000,
              startDate: "29 Nov 2025",
              endDate: "01 Des 2025",
              ticketId: "TKT-3DP-001",
              qrCode: "QR-3DAYS-001",
              quantity: 1
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
              price: 180000,
              startDate: "21 Jan 2026",
              endDate: "22 Jan 2026",
              ticketId: "TKT-WKP-003",
              qrCode: "QR-WKP-003",
              quantity: 1
            }
          ]
        }
      ]
    }
  ];

  // Fungsi untuk toggle dropdown transaksi
  const toggleDropdown = (transactionId) => {
    setExpandedTransactions(prev => ({
      ...prev,
      [transactionId]: !prev[transactionId]
    }));
  };

  // Fungsi untuk menampilkan detail tiket
  const handleShowDetail = (transaction, event, detail) => {
    setSelectedTicket({
      transaction: transaction,
      event: event,
      detail: detail
    });
    setShowDetailDialog(true);
  };

  // Fungsi untuk menutup dialog detail
  const handleCloseDetail = () => {
    setShowDetailDialog(false);
    setSelectedTicket(null);
  };

  // Hitung total per event
  const calculateEventTotal = (event) => {
    return event.details.reduce((total, detail) => total + (detail.price * detail.quantity), 0);
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 bg-white shadow-xl rounded-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Riwayat Pembelian Tiket</h1>
            <p className="text-gray-600 mt-2">Semua transaksi tiket yang telah Anda lakukan</p>
          </div>

          {/* Daftar Transaksi */}
          <div className="space-y-6 pb-8">
            {transactions.map((transaction, index) => (
              <div key={transaction.transactionId} className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
                
                {/* Header Transaksi */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h2 className="text-lg font-bold text-gray-900">Transaksi #{transaction.transactionId}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'Berhasil' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Tanggal Transaksi: {transaction.transactionDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span>Total: {formatCurrency(transaction.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDropdown(transaction.transactionId)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <span>Rincian</span>
                    <svg
                      className={`w-4 h-4 transform transition-transform ${
                        expandedTransactions[transaction.transactionId] ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Dropdown Content - Detail Events dalam Transaksi */}
                {expandedTransactions[transaction.transactionId] && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Detail Event dalam Transaksi:</h3>
                    
                    {/* List Events */}
                    <div className="space-y-4">
                      {transaction.events.map((event, eventIndex) => (
                        <div key={eventIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          
                          {/* Header Event */}
                          <div className="mb-3">
                            <h4 className="font-bold text-gray-900">{event.eventName}</h4>
                            <p className="text-gray-600 text-xs mt-1">{event.address}</p>
                            <div className="flex items-center gap-1 text-gray-600 text-xs mt-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{formatDateRange(event.startDate, event.endDate)}</span>
                            </div>
                          </div>

                          {/* Detail Tiket per Event */}
                          <div className="space-y-3">
                            {event.details.map((detail, detailIndex) => (
                              <div key={detailIndex} className="p-3 bg-white rounded-lg border border-gray-300">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 text-sm">{detail.type}</h5>
                                    <div className="flex items-center gap-2 text-gray-600 text-xs mt-1">
                                      <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>{formatDateRange(detail.startDate, detail.endDate)}</span>
                                      </div>
                                      <span>•</span>
                                      <span>Qty: {detail.quantity}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleShowDetail(transaction, event, detail)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap ml-4"
                                  >
                                    Rincian Tiket
                                  </button>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-gray-600 text-xs mb-1">
                                      {detail.description}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                      Ticket ID: {detail.ticketId}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-gray-900 text-sm">
                                      {formatCurrency(detail.price)} × {detail.quantity}
                                    </p>
                                    <p className="font-bold text-gray-900">
                                      {formatCurrency(detail.price * detail.quantity)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Total per Event */}
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                            <span className="font-semibold text-gray-900">Subtotal Event:</span>
                            <span className="font-bold text-gray-900">
                              {formatCurrency(calculateEventTotal(event))}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Transaksi */}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                      <span className="text-lg font-bold text-gray-900">Total Transaksi:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(transaction.totalAmount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dialog Detail Tiket */}
      {showDetailDialog && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {selectedTicket.event.eventName}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{selectedTicket.detail.type}</p>
              
              {/* Detail Tiket */}
              <div className="text-left space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Transaction ID:</span>
                  <span className="font-semibold text-sm">{selectedTicket.transaction.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Ticket ID:</span>
                  <span className="font-semibold text-sm">{selectedTicket.detail.ticketId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Harga:</span>
                  <span className="font-semibold text-sm">{formatCurrency(selectedTicket.detail.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Quantity:</span>
                  <span className="font-semibold text-sm">{selectedTicket.detail.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Subtotal:</span>
                  <span className="font-semibold text-sm">
                    {formatCurrency(selectedTicket.detail.price * selectedTicket.detail.quantity)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Tanggal Event:</span>
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
                onClick={handleCloseDetail}
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