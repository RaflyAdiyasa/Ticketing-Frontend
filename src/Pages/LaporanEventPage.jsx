import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CalendarDays, MapPin, Download, Ticket, Users, DollarSign, Heart, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { eventAPI } from "../services/api";

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
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
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
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-12 h-12 text-gray-300" />
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${type === 'purchase' ? 'bg-blue-100' : 'bg-green-100'}`}>
              <Icon className={`w-5 h-5 ${type === 'purchase' ? 'text-blue-600' : 'text-green-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!validData ? (
            <EmptyStateChart 
              message={emptyMessage}
              icon={Icon}
            />
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Pie Chart - Centered */}
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="w-64 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                        label={renderCustomizedLabel}
                        labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
                      >
                        {data.map((_, index) => (
                          <Cell 
                            key={index} 
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
                <div className="space-y-3">
                  {data.map((item, index) => {
                    const total = data.reduce((sum, d) => sum + d.value, 0);
                    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                    
                    return (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="font-medium text-gray-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${type === 'purchase' ? 'text-blue-600' : 'text-green-600'}`}>
                            {item.value}
                          </span>
                          <span className="text-gray-400 text-sm ml-2">({percentage}%)</span>
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

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-36">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-gray-600 font-medium">Memuat laporan event...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-36">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-xl text-gray-800 font-semibold mb-2">Terjadi Kesalahan</p>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-36">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-800 font-semibold mb-2">Data Tidak Ditemukan</p>
            <p className="text-gray-600 mb-6">Laporan untuk event ini tidak tersedia</p>
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalQuota = metrics?.total_quota || reportData.total_quota || 0;
  const totalSold = reportData.total_tickets_sold || 0;
  const totalCheckins = reportData.total_checkins || 0;
  const totalIncome = reportData.total_income || 0;

  return (
    <div className="min-h-screen bg-gray-50 mt-15">
      <Navbar />

      <div className="min-h-screen pt-28 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">Laporan Event</p>
                <h1 className="text-2xl font-bold text-gray-800">{reportData.event?.name || 'N/A'}</h1>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4"/>
                     {reportData.event?.date_start 
                      ? new Date(reportData.event.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
                      : 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4"/>
                    {reportData.event?.venue || '-'}, {reportData.event?.location || '-'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => navigate(-1)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                ← Kembali
              </button>
            </div>
          </div>

          {/* STATISTICS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Tiket Terjual */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Ticket className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Tiket Terjual</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{totalSold}</p>
              <p className="text-sm text-gray-500 mt-1">dari {totalQuota} kuota</p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${totalQuota > 0 ? Math.min((totalSold / totalQuota) * 100, 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Check-in */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Check-in</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{totalCheckins}</p>
              <p className="text-sm text-gray-500 mt-1">dari {totalSold} tiket</p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${totalSold > 0 ? Math.min((totalCheckins / totalSold) * 100, 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Pendapatan */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Pendapatan</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{formatRupiah(totalIncome)}</p>
              <p className="text-sm text-gray-500 mt-1">total penjualan</p>
            </div>

            {/* Tingkat Kehadiran */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Kehadiran</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{metrics?.attendance_rate || "0%"}</p>
              <p className="text-sm text-gray-500 mt-1">tingkat kehadiran</p>
            </div>

            {/* Likes */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Heart className="w-4 h-4 text-pink-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Likes</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{reportData.total_likes || 0}</p>
              <p className="text-sm text-gray-500 mt-1">total likes</p>
            </div>
          </div>

          {/* DETAIL TABLE */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Detail Penjualan per Kategori Tiket</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Kategori</th>
                    <th className="text-center px-4 py-4 font-semibold text-gray-700">Harga</th>
                    <th className="text-center px-4 py-4 font-semibold text-gray-700">Kuota</th>
                    <th className="text-center px-4 py-4 font-semibold text-gray-700">Terjual</th>
                    <th className="text-center px-4 py-4 font-semibold text-gray-700">Check-in</th>
                    <th className="text-right px-6 py-4 font-semibold text-gray-700">Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {(!reportData.purchase_data || reportData.purchase_data.length === 0) ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <Ticket className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p>Tidak ada kategori tiket</p>
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
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                              />
                              <span className="font-medium text-gray-800">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center text-gray-600">{formatRupiah(price)}</td>
                          <td className="px-4 py-4 text-center text-gray-600">{quota}</td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-semibold text-blue-600">{sold}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${Math.min(soldPercent, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">{soldPercent}%</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-semibold text-green-600">{checkinCount}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${Math.min(checkinPercent, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">{checkinPercent}%</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-purple-600">
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
                      <td className="px-6 py-4 text-gray-800">Total</td>
                      <td className="px-4 py-4 text-center text-gray-600">-</td>
                      <td className="px-4 py-4 text-center text-gray-800">{totalQuota}</td>
                      <td className="px-4 py-4 text-center text-blue-600">{totalSold}</td>
                      <td className="px-4 py-4 text-center text-green-600">{totalCheckins}</td>
                      <td className="px-6 py-4 text-right text-purple-600">{formatRupiah(totalIncome)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartWithLegend 
              data={reportData.purchase_data}
              title="Distribusi Penjualan Tiket"
              subtitle="Persentase tiket terjual per kategori"
              type="purchase"
              icon={Ticket}
              emptyMessage="Belum ada tiket yang terjual"
            />
            
            <ChartWithLegend 
              data={reportData.checkin_data}
              title="Distribusi Check-in"
              subtitle="Persentase kehadiran per kategori"
              type="checkin"
              icon={Users}
              emptyMessage="Belum ada pengunjung check-in"
            />
          </div>

          {/* DOWNLOAD BUTTON */}
          <div className="flex justify-center">
            <button 
              onClick={handleDownloadReport}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
            >
              <Download size={20} />
              Unduh Laporan (CSV)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}