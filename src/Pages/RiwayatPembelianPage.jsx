import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { transactionAPI } from "../services/api";

export default function RiwayatTransaksi() {
  const navigate = useNavigate();
  const [expandedTransactions, setExpandedTransactions] = useState({});
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data dari backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await transactionAPI.getTransactionHistory();
        console.log("Transaction response:", response.data);
        
        if (response.data && response.data.transactions) {
          // Transform data dari backend ke format yang dibutuhkan frontend
          const transformedTransactions = response.data.transactions.map(transaction => ({
            transactionId: transaction.transaction_id,
            transactionDate: new Date(transaction.transaction_time).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            transactionTime: transaction.transaction_time,
            totalAmount: transaction.price_total,
            status: getStatusLabel(transaction.transaction_status),
            statusRaw: transaction.transaction_status,
            events: transaction.events.map(event => ({
              id: event.event_id,
              eventName: event.event_name,
              address: event.location,
              city: event.city,
              startDate: new Date(event.date_start).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }),
              endDate: new Date(event.date_end).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }),
              image: event.image,
              eventSubtotal: event.event_subtotal, // Tambahkan event_subtotal dari backend
              details: groupTicketsByCategory(event.ticket_details)
            }))
          }));
          
          setTransactions(transformedTransactions);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.response?.data?.error || "Gagal mengambil data transaksi");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Function untuk mengelompokkan tiket berdasarkan kategori
  const groupTicketsByCategory = (ticketDetails) => {
    // Jika tidak ada ticket details, kembalikan array kosong
    if (!ticketDetails || ticketDetails.length === 0) {
      return [];
    }
    
    const grouped = {};
    
    ticketDetails.forEach(ticket => {
      const key = ticket.ticket_category_id;
      
      if (!grouped[key]) {
        grouped[key] = {
          type: ticket.category_name,
          description: ticket.description,
          price: ticket.price,
          startDate: new Date(ticket.date_time_start).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          endDate: new Date(ticket.date_time_end).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          ticketCategoryId: ticket.ticket_category_id,
          quantity: 0,
          tickets: []
        };
      }
      
      grouped[key].quantity += 1;
      grouped[key].tickets.push({
        ticketId: ticket.ticket_id,
        code: ticket.code,
        status: ticket.status
      });
    });
    
    return Object.values(grouped);
  };

  // Function untuk mengkonversi status
  const getStatusLabel = (status) => {
    const statusMap = {
      'paid': 'Berhasil',
      'pending': 'Menunggu Pembayaran',
      'failed': 'Gagal',
      'expired': 'Kadaluarsa',
      'cancelled': 'Dibatalkan'
    };
    return statusMap[status] || status;
  };

  // Function untuk mendapatkan warna status badge
  const getStatusColor = (status) => {
    const colorMap = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800',
      'expired': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

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

  // Hitung total per event - dengan fallback ke eventSubtotal dari backend
  const calculateEventTotal = (event) => {
    // Jika event memiliki event_subtotal dari backend, gunakan itu
    if (event.eventSubtotal !== undefined && event.eventSubtotal !== null) {
      return event.eventSubtotal;
    }
    
    // Fallback: hitung manual dari details
    return event.details.reduce((total, detail) => total + (detail.price * detail.quantity), 0);
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Memuat riwayat transaksi...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Terjadi Kesalahan</h3>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Belum Ada Transaksi</h3>
            <p className="mt-2 text-gray-600">Anda belum memiliki riwayat pembelian tiket</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Jelajahi Event
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Header Transaksi */}
                <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-bold text-gray-900">
                        {transaction.transactionId}
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.statusRaw)}`}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{transaction.transactionDate}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  <div className="mt-4 border-t border-gray-200 pt-4 px-6 pb-6">
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
                            {event.details.length > 0 ? (
                              event.details.map((detail, detailIndex) => (
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
                                    {detail.tickets && detail.tickets.length > 0 && (
                                      <button
                                        onClick={() => handleShowDetail(transaction, event, detail)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap ml-4"
                                      >
                                        Rincian Tiket
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="text-gray-600 text-xs mb-1">
                                        {detail.description}
                                      </p>
                                      <p className="text-gray-500 text-xs">
                                        {detail.quantity} tiket
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
                              ))
                            ) : (
                              <div className="p-3 bg-white rounded-lg border border-gray-300 text-center">
                                <p className="text-gray-500 text-sm">Detail tiket tidak tersedia</p>
                              </div>
                            )}
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
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                  <span className="text-gray-600 text-sm">Kategori Tiket:</span>
                  <span className="font-semibold text-sm">{selectedTicket.detail.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Harga per Tiket:</span>
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

                {/* List Ticket IDs */}
                {selectedTicket.detail.tickets && selectedTicket.detail.tickets.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-600 text-sm mb-2">Daftar Tiket:</p>
                    <div className="space-y-2">
                      {selectedTicket.detail.tickets.map((ticket, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ticket #{idx + 1}:</span>
                            <span className="font-mono font-semibold">{ticket.ticketId}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-gray-600">Code:</span>
                            <span className="font-mono font-semibold">{ticket.code}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-semibold ${ticket.status === 'active' ? 'text-green-600' : ticket.status === 'checked_in' ? 'text-blue-600' : 'text-gray-600'}`}>
                              {ticket.status === 'active' ? 'Aktif' : ticket.status === 'checked_in' ? 'Sudah Check-in' : ticket.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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