import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";
import { eventAPI } from "../services/api";

export default function LaporanEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventReport();
  }, [eventId]);

  const fetchEventReport = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getEventReport(eventId);
      setReportData(response.data);
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

  const COLORS = ["#0C8CE9", "#36A2EB", "#A5B4FC", "#C7D2FE", "#93C5FD", "#60A5FA"];

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
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
              <p className="text-gray-600 mt-2">{reportData.event.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(reportData.event.date_start).toLocaleDateString('id-ID')} - {new Date(reportData.event.date_end).toLocaleDateString('id-ID')}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total Tiket Terjual</h3>
              <p className="text-2xl font-bold text-blue-600">{reportData.total_tickets_sold}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Total Check-in</h3>
              <p className="text-2xl font-bold text-green-600">{reportData.total_checkins}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Total Pendapatan</h3>
              <p className="text-2xl font-bold text-purple-600">{formatRupiah(reportData.total_income)}</p>
            </div>
          </div>

          {/* PRESENTASE PEMBELIAN TIKET */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Persentase Pembelian Tiket</h2>

            <div className="flex flex-col items-center">
              {/* PIE CHART WRAPPER */}
              <div className="w-60 h-60">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={reportData.purchase_data}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {reportData.purchase_data.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend Categories */}
              <div className="flex gap-4 mt-4 flex-wrap">
                {reportData.purchase_data.map((item, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 bg-gray-100 rounded-lg shadow text-sm flex items-center"
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    ></div>
                    {item.name}: {item.value} tiket
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PRESENTASE CHECK-IN TIKET */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Persentase Check-in Tiket</h2>

            <div className="flex flex-col items-center">
              <div className="w-60 h-60">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={reportData.checkin_data}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {reportData.checkin_data.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex gap-4 mt-4 flex-wrap">
                {reportData.checkin_data.map((item, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 bg-gray-100 rounded-lg shadow text-sm flex items-center"
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    ></div>
                    {item.name}: {item.value} check-in
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TOTAL PENDAPATAN */}
          <div className="mb-8">
            <p className="text-lg font-medium mb-6">
              Total Pendapatan :{" "}
              <span className="font-bold text-green-700 text-xl">
                {formatRupiah(reportData.total_income)}
              </span>
            </p>
          </div>

          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow"
          >
            <Download size={18} />
            Unduh Laporan (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}