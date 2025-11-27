import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Download } from "lucide-react";
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
      
      // Handle new response structure
      if (response.data.report && response.data.metrics) {
        setReportData(response.data.report);
        setMetrics(response.data.metrics);
      } else {
        // Fallback untuk struktur lama
        setReportData(response.data);
        setMetrics({
          total_attendant: response.data.total_checkins || 0,
          total_tickets_sold: response.data.total_tickets_sold || 0,
          total_sales: response.data.total_income || 0,
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
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-event-${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading report:", err);
      alert("Gagal mengunduh laporan");
    }
  };

  // Warna yang lebih kontras untuk kategori banyak
  const CONTRAST_COLORS = [
    "#0C8CE9", "#FF6B6B", "#4ECDC4", "#FFA726", "#9966CC", 
    "#42A5F5", "#66BB6A", "#FF7043", "#AB47BC", "#26C6DA",
    "#D4E157", "#FFCA28", "#8D6E63", "#78909C", "#7E57C2",
    "#EC407A", "#5C6BC0", "#26A69A", "#FFA000", "#607D8B"
  ];

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Fungsi untuk mendapatkan warna berdasarkan data
  const getChartColors = (data) => {
    if (!data || data.length === 0) {
      return ['#FF6B6B']; // Warna merah untuk data kosong
    }

    // Cek jika semua data value = 0
    const allZero = data.every(item => item.value === 0);
    if (allZero) {
      return ['#FF6B6B']; // Warna merah untuk semua data 0
    }

    return CONTRAST_COLORS;
  };

  // Custom label untuk pie chart
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, name, value
  }) => {
    // Jangan tampilkan label jika value = 0 atau percent = 0
    if (percent === 0 || value === 0) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Fungsi untuk render pie chart yang reusable
  const renderPieChart = (data, title, tooltipFormatter) => {
    const colors = getChartColors(data);
    const hasData = data && data.length > 0 && !data.every(item => item.value === 0);

    return (
      <div className="w-full md:w-1/2 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={hasData ? data : [{ name: 'Tidak ada data', value: 1 }]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={hasData ? 2 : 0}
              label={hasData ? renderCustomizedLabel : false}
              labelLine={false}
            >
              {(hasData ? data : [{ name: 'Tidak ada data', value: 1 }]).map((_, index) => (
                <Cell 
                  key={index} 
                  fill={colors[index % colors.length]} 
                  stroke={hasData ? "#fff" : "none"}
                  strokeWidth={hasData ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={hasData ? tooltipFormatter : (value) => ['Tidak ada data', '']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Fungsi untuk render legend yang reusable
  const renderLegend = (data, title) => {
    const colors = getChartColors(data);
    const hasData = data && data.length > 0 && !data.every(item => item.value === 0);

    return (
      <div className="w-full md:w-1/2">
        <div className="grid grid-cols-1 gap-3">
          {(hasData ? data : [{ name: 'Tidak ada data', value: 0 }]).map((item, i) => (
            <div
              key={i}
              className="p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: colors[i % colors.length] }}
                  ></div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    hasData ? (title.includes('Pembelian') ? 'text-blue-600' : 'text-green-600') : 'text-red-600'
                  }`}>
                    {hasData ? `${item.value} ${title.includes('Pembelian') ? 'tiket' : 'check-in'}` : '0'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {hasData && reportData.total_tickets_sold > 0 && title.includes('Pembelian') 
                      ? `${((item.value / reportData.total_tickets_sold) * 100).toFixed(1)}%` 
                      : hasData && reportData.total_checkins > 0 && title.includes('Check-in')
                      ? `${((item.value / reportData.total_checkins) * 100).toFixed(1)}%`
                      : '0%'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center pt-36">
          <div className="text-lg">Memuat laporan event...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center pt-36">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center pt-36">
          <div className="text-lg">Data laporan tidak ditemukan</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] px-4 py-6 flex justify-center">
        <div className="w-full max-w-6xl bg-white shadow-xl rounded-xl p-10 mt-32">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Laporan Event</h1>
              <p className="text-gray-600 mt-2">{reportData.event?.name || 'N/A'}</p>
              <p className="text-sm text-gray-500">
                {reportData.event?.date_start ? new Date(reportData.event.date_start).toLocaleDateString('id-ID') : 'N/A'} - {reportData.event?.date_end ? new Date(reportData.event.date_end).toLocaleDateString('id-ID') : 'N/A'}
              </p>
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              Kembali
            </button>
          </div>

          {/* STATISTICS SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total Tiket Terjual</h3>
              <p className="text-2xl font-bold text-blue-600">{reportData.total_tickets_sold || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Total Check-in</h3>
              <p className="text-2xl font-bold text-green-600">{reportData.total_checkins || 0}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Total Pendapatan</h3>
              <p className="text-2xl font-bold text-purple-600">{formatRupiah(reportData.total_income || 0)}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800">Tingkat Kehadiran</h3>
              <p className="text-2xl font-bold text-orange-600">
                {metrics?.attendance_rate || "0%"}
              </p>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="font-semibold text-pink-800">Total Likes</h3>
              <p className="text-2xl font-bold text-pink-600">{reportData.total_likes || 0}</p>
            </div>
          </div>

          {/* PRESENTASE PEMBELIAN TIKET */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Persentase Pembelian Tiket per Kategori</h2>

            <div className="flex flex-col md:flex-row items-center justify-between">
              {/* PIE CHART */}
              {renderPieChart(
                reportData.purchase_data, 
                'Pembelian',
                (value) => [`${value} tiket`, 'Terjual']
              )}

              {/* LEGEND & DETAILS */}
              {renderLegend(reportData.purchase_data, 'Pembelian')}
            </div>
          </div>

          {/* PRESENTASE CHECK-IN TIKET */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Persentase Check-in Tiket per Kategori</h2>

            <div className="flex flex-col md:flex-row items-center justify-between">
              {/* PIE CHART */}
              {renderPieChart(
                reportData.checkin_data, 
                'Check-in',
                (value) => [`${value} check-in`, 'Hadir']
              )}

              {/* LEGEND & DETAILS */}
              {renderLegend(reportData.checkin_data, 'Check-in')}
            </div>
          </div>

          {/* METRICS TAMBAHAN */}
          {metrics && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800">Persentase Tiket Terjual</h3>
                <p className="text-xl font-bold text-gray-700">
                  {metrics.sold_percentage || "0%"}
                </p>
                <p className="text-sm text-gray-500">Dari total kuota tiket</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800">Tingkat Kehadiran</h3>
                <p className="text-xl font-bold text-gray-700">
                  {metrics.attendance_rate || "0%"}
                </p>
                <p className="text-sm text-gray-500">Dari total tiket terjual</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800">Total Likes</h3>
                <p className="text-xl font-bold text-gray-700">
                  {reportData.total_likes || 0}
                </p>
                <p className="text-sm text-gray-500">Jumlah like yang diterima</p>
              </div>
            </div>
          )}

          {/* TOTAL PENDAPATAN */}
          <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-lg font-medium">
              Total Pendapatan :{" "}
              <span className="font-bold text-green-700 text-2xl">
                {formatRupiah(reportData.total_income || 0)}
              </span>
            </p>
          </div>

          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow transition duration-200"
          >
            <Download size={19} />
            Unduh Laporan (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}