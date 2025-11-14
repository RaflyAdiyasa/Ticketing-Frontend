import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { authAPI } from "../services/api";

export default function DaftarForm() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "user"
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authAPI.register(formData);
      
      if (response.data.message) {
        alert("Registrasi berhasil! Silakan login.");
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-end justify-center p-4 overflow-auto">
      <div className="w-full max-w-lg my-45 bg-white shadow-xl rounded-2xl p-8 ">
        <h2 className="text-2xl font-bold text-center mb-6">Daftar</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-500 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Masukkan Nama Lengkap"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border border-gray-500 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Masukkan Username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-500 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Masukkan Email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-500 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Masukkan Password"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-500 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Konfirmasi Password"
              required
            />
          </div>
        
          <button
            type="submit"
            disabled={loading}
            className="w-full mb-7 bg-[#044888] text-white py-2 rounded-xl hover:bg-[#0C8CE9] transition-all disabled:opacity-50"
          >
            {loading ? "Loading..." : "Daftar"}
          </button>

          <p className="text-sm text-left mb-3">
            Ingin mengadakan Event?{" "}
            <Link to="/daftarEO" className="text-indigo-600 font-medium hover:underline">
              Daftar Sebagai Penyelenggara Event
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}