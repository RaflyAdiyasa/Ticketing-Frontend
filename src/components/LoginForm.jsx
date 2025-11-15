import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { authAPI } from "../services/api";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username_or_email: "",
    password: ""
  });
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
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(formData);
      
      if (response.data.token) {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
        
        navigate('/');
      
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-end justify-center p-4 overflow-auto">
      <div className="w-full max-w-lg my-45 bg-white shadow-xl rounded-2xl p-8 ">
        <h2 className="text-2xl font-bold text-center mb-6">Masuk ke Akun</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email/Username</label>
            <input
              type="text"
              name="username_or_email"
              value={formData.username_or_email}
              onChange={handleChange}
              className="w-full border border-gray-500 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Masukkan Email atau Username"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#044888] text-white py-2 rounded-xl hover:bg-[#0C8CE9] transition-all disabled:opacity-50"
          >
            {loading ? "Loading..." : "Masuk"}
          </button>
          
          <p className="text-sm text-left mt-2">
            Belum punya Akun? 
            <Link to="/daftar" className="text-indigo-600 font-medium hover:underline"> Daftar</Link>
          </p>
          <p className="text-sm text-left mb-3">
            Ingin mengadakan Event? 
            <Link to="/daftarEO" className="text-indigo-600 font-medium hover:underline">
              Daftar Sebagai Penyelenggara Event
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}