import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { 
  CalendarDays, 
  MapPin, 
  Download, 
  Ticket, 
  Users, 
  DollarSign, 
  Heart, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  FileText,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { eventAPI } from "../services/api";
import { motion } from "framer-motion";

export default function LaporanEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventReport();
  }, [eventId]);

  const fetchEventReport = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getEventReport(eventId);
      
      if (response.data.report && response.data.metrics) {
        setReportData(response.data.report);
        setMetrics(response.data.metrics);
      } else {
        setReportData(response.data);
        setMetrics({
          total_attendant: response.data.total_checkins || 0,
          total_tickets_sold: response.data.total_tickets_sold || 0,
          total_sales: response.data.total_income || 0,
          total_quota: response.data.total_quota || 0,
          sold_percentage: "0%",
          attendance_rate: "0%"
        });
      }
    } catch (err) {
      console.error("Error fetching event report:", err);
      setError("Gagal memuat laporan event");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await eventAPI.downloadEventReport(eventId);
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-event-${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading report:", err);
      alert("Gagal mengunduh laporan");
    }
  };

  const CHART_COLORS = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", 
    "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
  ];

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  const hasValidData = (data) => {
    if (!data || data.length === 0) return false;
    return data.some(item => item.value > 0);
  };

  // Custom label di dalam pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, value }) => {
    if (percent < 0.05 || value === 0) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#374151"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Empty State Component
  const EmptyStateChart = ({ message, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />
      </div>
      <p className="text-gray-500 font-medium text-sm sm:text-base">{message}</p>
    </div>
  );

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, type }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-gray-600">
            {data.value} {type === 'purchase' ? 'tiket terjual' : 'check-in'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Chart Section dengan Legend di samping
  const ChartWithLegend = ({ data, title, subtitle, type, icon: Icon, emptyMessage }) => {
    const validData = hasValidData(data);
    
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-1.5 sm:p-2 rounded-lg ${type === 'purchase' ? 'bg-blue-100' : 'bg-green-100'}`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${type === 'purchase' ? 'text-blue-600' : 'text-green-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{title}</h3>
              <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 bg-white">
          {!validData ? (
            <EmptyStateChart 
              message={emptyMessage}
              icon={Icon}
            />
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
              {/* Pie Chart - dengan container yang memiliki dimensi eksplisit */}
              <div className="w-full lg:w-1/2 flex justify-center">
                <div style={{ width: '100%', maxWidth: '256px', height: '256px', minHeight: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        label={renderCustomizedLabel}
                        labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
                      >
                        {data.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]} 
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip type={type} />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Legend - Custom */}
              <div className="w-full lg:w-1/2">
                <div className="space-y-2 sm:space-y-3">
                  {data.map((item, index) => {
                    const total = data.reduce((sum, d) => sum + d.value, 0);
                    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                    
                    return (
                      <div 
                        key={`legend-${index}`}
                        className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div 
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="font-medium text-gray-700 text-sm sm:text-base">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold text-sm sm:text-base ${type === 'purchase' ? 'text-blue-600' : 'text-green-600'}`}>
                            {item.value}
                          </span>
                          <span className="text-gray-400 text-xs sm:text-sm ml-1 sm:ml-2">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const totalQuota = metrics?.total_quota || reportData?.total_quota || 0;
  const totalSold = reportData?.total_tickets_sold || 0;
  const totalCheckins = reportData?.total_checkins || 0;
  const totalIncome = reportData?.total_income || 0;

  return (
    <div className="min-h-screen py-8">
      <Navbar />

      <div className="py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto mt-28 sm:mt-32">
          {/* SATU KOTAK BESAR UNTUK SEMUA KONTEN */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8"
          >
            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-600 font-medium text-sm sm:text-base">
                  Memuat laporan event...
                </p>
              </div>
            ) : error ? (
              /* Error State */
              <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                </div>
                <p className="text-lg sm:text-xl text-gray-800 font-semibold mb-2">Terjadi Kesalahan</p>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium text-sm sm:text-base"
                >
                  <ArrowLeft size={16} />
                  Kembali
                </button>
              </div>
            ) : !reportData ? (
              /* No Data State */
              <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <p className="text-lg sm:text-xl text-gray-800 font-semibold mb-2">Data Tidak Ditemukan</p>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">Laporan untuk event ini tidak tersedia</p>
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium text-sm sm:text-base"
                >
                  <ArrowLeft size={16} />
                  Kembali
                </button>
              </div>
            ) : (
              /* Main Content */
              <>
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="flex flex-col gap-4 mb-6 sm:mb-8"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                        Laporan Event
                      </h1>
                      <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                        Analisis dan statistik event Anda
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                      <button
                        onClick={fetchEventReport}
                        className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg transition-colors font-medium text-sm sm:text-base"
                      >
                        <RefreshCw
                          size={16}
                          className={`sm:w-[18px] sm:h-[18px] ${loading ? "animate-spin" : ""}`}
                        />
                        <span className="hidden sm:inline">Refresh</span>
                      </button>
                      
                      <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg transition-colors font-medium text-sm sm:text-base"
                      >
                        <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="hidden sm:inline">Kembali</span>
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Event Info Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-blue-100"
                >
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-3">
                    {reportData.event?.name || 'N/A'}
                  </h2>
                  <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <span className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                      <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600"/>
                      {reportData.event?.date_start 
                        ? new Date(reportData.event.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
                        : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500"/>
                      {reportData.event?.venue || '-'}, {reportData.event?.location || '-'}
                    </span>
                  </div>
                </motion.div>

                {/* Statistics Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8"
                >
                  {/* Tiket Terjual */}
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                        <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Tiket Terjual</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{totalSold}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">dari {totalQuota} kuota</p>
                    <div className="mt-2 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${totalQuota > 0 ? Math.min((totalSold / totalQuota) * 100, 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Check-in */}
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Check-in</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{totalCheckins}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">dari {totalSold} tiket</p>
                    <div className="mt-2 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${totalSold > 0 ? Math.min((totalCheckins / totalSold) * 100, 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Pendapatan */}
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Pendapatan</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{formatRupiah(totalIncome)}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">total penjualan</p>
                  </div>

                  {/* Tingkat Kehadiran */}
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Kehadiran</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{metrics?.attendance_rate || "0%"}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">tingkat kehadiran</p>
                  </div>

                  {/* Likes */}
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="p-1.5 sm:p-2 bg-pink-100 rounded-lg">
                        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Likes</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{reportData.total_likes || 0}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">total likes</p>
                  </div>
                </motion.div>

                {/* Detail Table */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                    Detail Penjualan per Kategori Tiket
                  </h3>
                  
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-700 text-xs sm:text-sm">Kategori</th>
                            <th className="text-center px-3 sm:px-4 py-3 sm:py-4 font-semibold text-gray-700 text-xs sm:text-sm">Harga</th>
                            <th className="text-center px-3 sm:px-4 py-3 sm:py-4 font-semibold text-gray-700 text-xs sm:text-sm">Kuota</th>
                            <th className="text-center px-3 sm:px-4 py-3 sm:py-4 font-semibold text-gray-700 text-xs sm:text-sm">Terjual</th>
                            <th className="text-center px-3 sm:px-4 py-3 sm:py-4 font-semibold text-gray-700 text-xs sm:text-sm">Check-in</th>
                            <th className="text-right px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-700 text-xs sm:text-sm">Pendapatan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(!reportData.purchase_data || reportData.purchase_data.length === 0) ? (
                            <tr>
                              <td colSpan="6" className="px-6 py-10 sm:py-12 text-center text-gray-500">
                                <Ticket className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm sm:text-base">Tidak ada kategori tiket</p>
                              </td>
                            </tr>
                          ) : (
                            reportData.purchase_data.map((item, index) => {
                              const checkin = reportData.checkin_data?.find(c => c.name === item.name) || { value: 0 };
                              const quota = item.quota || 0;
                              const price = item.price || 0;
                              const sold = item.value || 0;
                              const checkinCount = checkin.value || 0;
                              const income = sold * price;
                              const soldPercent = quota > 0 ? ((sold / quota) * 100).toFixed(0) : 0;
                              const checkinPercent = sold > 0 ? ((checkinCount / sold) * 100).toFixed(0) : 0;

                              return (
                                <tr key={`row-${index}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div 
                                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                      />
                                      <span className="font-medium text-gray-800 text-xs sm:text-sm">{item.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-gray-600 text-xs sm:text-sm">{formatRupiah(price)}</td>
                                  <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-gray-600 text-xs sm:text-sm">{quota}</td>
                                  <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                                    <div className="flex flex-col items-center">
                                      <span className="font-semibold text-blue-600 text-xs sm:text-sm">{sold}</span>
                                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                        <div className="w-12 sm:w-20 h-1 sm:h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${Math.min(Number(soldPercent), 100)}%` }}
                                          />
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-gray-500">{soldPercent}%</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                                    <div className="flex flex-col items-center">
                                      <span className="font-semibold text-green-600 text-xs sm:text-sm">{checkinCount}</span>
                                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                        <div className="w-12 sm:w-20 h-1 sm:h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ width: `${Math.min(Number(checkinPercent), 100)}%` }}
                                          />
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-gray-500">{checkinPercent}%</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-right font-semibold text-purple-600 text-xs sm:text-sm">
                                    {formatRupiah(income)}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                        {reportData.purchase_data && reportData.purchase_data.length > 0 && (
                          <tfoot>
                            <tr className="bg-gray-50 font-semibold">
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-800 text-xs sm:text-sm">Total</td>
                              <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-gray-600 text-xs sm:text-sm">-</td>
                              <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-gray-800 text-xs sm:text-sm">{totalQuota}</td>
                              <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-blue-600 text-xs sm:text-sm">{totalSold}</td>
                              <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-green-600 text-xs sm:text-sm">{totalCheckins}</td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-purple-600 text-xs sm:text-sm">{formatRupiah(totalIncome)}</td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                </motion.div>

                {/* Charts Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
                >
                  <ChartWithLegend 
                    data={reportData.purchase_data || []}
                    title="Distribusi Penjualan Tiket"
                    subtitle="Persentase tiket terjual per kategori"
                    type="purchase"
                    icon={Ticket}
                    emptyMessage="Belum ada tiket yang terjual"
                  />
                  
                  <ChartWithLegend 
                    data={reportData.checkin_data || []}
                    title="Distribusi Check-in"
                    subtitle="Persentase kehadiran per kategori"
                    type="checkin"
                    icon={Users}
                    emptyMessage="Belum ada pengunjung check-in"
                  />
                </motion.div>

                {/* Download Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex justify-center"
                >
                  <button 
                    onClick={handleDownloadReport}
                    className="flex items-center gap-2 sm:gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-sm sm:text-base"
                  >
                    <Download size={18} className="sm:w-5 sm:h-5" />
                    Unduh Laporan (CSV)
                  </button>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}