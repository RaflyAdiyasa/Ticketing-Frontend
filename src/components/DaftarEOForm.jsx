import { useState } from "react";

export default function DaftarForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [namaInstansi, setNamaInstansi] = useState("");
  const [jenisInstansi, setJenisInstansi] = useState("");
  const [namaPengurus, setNamaPengurus] = useState("");
  const [ktpFile, setKtpFile] = useState(null);
  const [ktpPreview, setKtpPreview] = useState(null);
  const [password2, setPassword2] = useState("");

  // Extra state
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleKtpChange = (e) => {
    const file = e.target.files[0];

    // reset error & progress
    setErrorMsg("");
    setUploadProgress(0);

    if (!file) return;

    // ✅ Validasi format file JPG/PNG
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setErrorMsg("Format tidak valid. Hanya diperbolehkan JPG atau PNG.");
      return;
    }

    setKtpFile(file);

    // Preview gambar
    const imageUrl = URL.createObjectURL(file);
    setKtpPreview(imageUrl);

    // ✅ Progress bar simulasi upload (nanti bisa diganti ke upload backend)
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) clearInterval(interval);
    }, 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== password2) {
      alert("Password dan konfirmasi tidak sama!");
      return;
    }

    if (!ktpFile) {
      alert("Harap upload foto KTP!");
      return;
    }

    // FormData (jika nanti ingin submit ke backend)
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("username", username);
    formData.append("namaInstansi", namaInstansi);
    formData.append("jenisInstansi", jenisInstansi);
    formData.append("namaPengurus", namaPengurus);
    formData.append("ktpFile", ktpFile);

    console.log("✅ Data siap dikirim ke backend");
  };

  return (
    <>
      <div className="min-h-screen flex items-start justify-center p-4 overflow-auto">
        <div className="w-full max-w-lg bg-white shadow-xl my-50 rounded-2xl p-8 ">
          <h2 className="text-2xl font-bold text-center mb-6">
            Daftar Sebagai <br /> Penyelenggara Event
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Instansi */}
            <div>
              <label className="block text-gray-700 mb-1">Nama Instansi</label>
              <input
                type="text"
                value={namaInstansi}
                onChange={(e) => setNamaInstansi(e.target.value)}
                className="w-full border border-gray-500 rounded-xl px-4 py-2"
                placeholder="Masukkan Nama Instansi"
                required
              />
            </div>

            {/* Jenis Instansi dropdown */}
            <div>
              <label className="block text-gray-700 mb-1">Jenis Instansi</label>
              <select
                value={jenisInstansi}
                onChange={(e) => setJenisInstansi(e.target.value)}
                className="w-full border border-gray-500 rounded-xl px-4 py-2 cursor-pointer"
                required
              >
                <option value="">-- Pilih Jenis Instansi --</option>
                <option value="Perguruan Tinggi">Perguruan Tinggi</option>
                <option value="Sekolah">Sekolah</option>
                <option value="Perusahaan">Perusahaan</option>
                <option value="Organisasi">Organisasi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Nama Pengurus */}
            <div>
              <label className="block text-gray-700 mb-1">Nama Pengurus</label>
              <input
                type="text"
                value={namaPengurus}
                onChange={(e) => setNamaPengurus(e.target.value)}
                className="w-full border border-gray-500 rounded-xl px-4 py-2"
                placeholder="Masukkan Nama Pengurus"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-500 rounded-xl px-4 py-2"
                placeholder="Masukkan Username"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-500 rounded-xl px-4 py-2"
                placeholder="Masukkan Email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-500 rounded-xl px-4 py-2"
                placeholder="Masukkan Password"
                required
              />
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-gray-700 mb-1">Konfirmasi Password</label>
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="w-full border border-gray-500 rounded-xl px-4 py-2"
                placeholder="Konfirmasi Password"
                required
              />
            </div>

            {/* Upload KTP */}
            <div>
              <label className="block text-gray-700 mb-1">Upload KTP (JPG/JPEG/PNG)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleKtpChange}
                className="w-full border border-gray-500 rounded-xl px-4 py-2 bg-gray-50  hover:bg-[#0C8CE9] cursor-pointer"
                
              />

              {/* Pesan error */}
              {errorMsg && (
                <p className="text-red-600 text-sm mt-1">{errorMsg}</p>
              )}

              {/* Progress bar */}
              {uploadProgress > 0 && (
                <div className="h-2 mt-2 bg-gray-300 rounded-xl overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              {/* Thumbnail preview */}
              {ktpPreview && (
                <img
                  src={ktpPreview}
                  alt="Preview KTP"
                  className="mt-3 w-40 rounded-lg shadow-md border cursor-pointer hover:opacity-80"
                  onClick={() => setIsModalOpen(true)}
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full mb-4 bg-[#044888] text-white py-2 rounded-xl hover:bg-[#0C8CE9] cursor-pointer transition-all"
            >
              Daftar
            </button>
          </form>
        </div>
      </div>

      {/* ✅ Modal Preview Gambar KTP */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-100"
          onClick={() => setIsModalOpen(false)}
        >
          <img
            src={ktpPreview}
            alt="KTP"
            className="w-[80%] max-w-lg rounded-xl shadow-2xl border-2 border-white"
          />
        </div>
      )}
    </>
  );
}
