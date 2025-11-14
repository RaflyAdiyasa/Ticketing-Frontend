import { useState } from "react";
import {Link} from "react-router"

export default function DaftarEOForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [password2, setPassword2] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Username:", username);
    console.log("Password:", namaLengkap);
    console.log("Password:", password2);
  };

  return (
    <div className="min-h-screen flex items-end justify-center p-4 overflow-auto">
      <div className="w-full max-w-lg my-45 bg-white shadow-xl rounded-2xl p-8 ">
        <h2 className="text-2xl font-bold text-center mb-6">Daftar</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              className="w-full border border-gray-500 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Masukkan Nama Lengkap"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-500 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Masukkan Username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-500 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Masukkan Email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full border border-gray-500 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="konfirmasi Password"
              required
            />
          </div>
        
          <button
            type="submit"
            className="w-full mb-7 bg-[#044888] text-white py-2 rounded-xl hover:bg-[#0C8CE9] transition-all"
          >
            Daftar
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
