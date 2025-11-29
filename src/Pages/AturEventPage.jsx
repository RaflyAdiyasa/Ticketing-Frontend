import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { MoreVertical, ChevronRight, Trash2, Pencil } from "lucide-react";

export default function AturEventPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("kategori");
  const [searchVenue, setSearchVenue] = useState("");


  // === Kategori Event ===
  const [categories, setCategories] = useState([
    { id: 1, name: "Music", subcategories: ["Festival", "Konser Arena"], open: false, menu: false },
    { id: 2, name: "Technology", subcategories: ["Seminar", "Expo"], open: false, menu: false },
  ]);
  const [newCategory, setNewCategory] = useState("");

  const addCategory = () => {
    if (!newCategory.trim()) return;
    setCategories([...categories, { id: Date.now(), name: newCategory, subcategories: [], open: false, menu: false }]);
    setNewCategory("");
  };

  const deleteCategory = (id) => {
    if (!confirm("Yakin ingin menghapus kategori?")) return;
    setCategories(categories.filter((c) => c.id !== id));
  };

  const deleteSubcategory = (catId, sub) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, subcategories: c.subcategories.filter((s) => s !== sub) } : c
      )
    );
  };

  // === Modal Subkategori ===
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newSub, setNewSub] = useState("");

  const openSubModal = (category) => {
    setSelectedCategory(category);
    setNewSub("");
    setSubModalOpen(true);
  };

  const saveSubcategory = () => {
    if (!newSub.trim()) return;
    setCategories((prev) =>
      prev.map((c) =>
        c.id === selectedCategory.id
          ? { ...c, subcategories: [...c.subcategories, newSub] }
          : c
      )
    );
    setSubModalOpen(false);
  };

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest("[id^='menu-']")) {
        setCategories((prev) => prev.map((c) => ({ ...c, menu: false })));
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // === Venue Event ===
  const [venues, setVenues] = useState([
    { id: 1, name: "Istora Senayan", district: "Tanah Abang", address: "Jl. Pintu Satu Senayan" },
    { id: 2, name: "JIExpo Kemayoran", district: "Kemayoran", address: "Jl. H. Benyamin Sueb" },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const [venueForm, setVenueForm] = useState({ name: "", district: "", address: "" });

  const openAddVenue = () => {
    setEditMode(false);
    setSelectedVenueId(null);
    setVenueForm({ name: "", district: "", address: "" });
    setModalOpen(true);
  };

  const openEditVenue = (venue) => {
    setEditMode(true);
    setSelectedVenueId(venue.id);
    setVenueForm({ name: venue.name, district: venue.district, address: venue.address });
    setModalOpen(true);
  };

  const saveVenueChanges = () => {
    setVenues((prev) =>
      prev.map((v) =>
        v.id === selectedVenueId
          ? { ...v, name: venueForm.name, district: venueForm.district, address: venueForm.address }
          : v
      )
    );
    setModalOpen(false);
  };

  const addVenue = () => {
    setVenues([...venues, { id: Date.now(), ...venueForm }]);
    setVenueForm({ name: "", district: "", address: "" });
    setModalOpen(false);
  };

  const deleteVenue = (id) => {
    if (!confirm("Hapus venue?")) return;
    setVenues(venues.filter((v) => v.id !== id));
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-5xl mx-auto pt-40 bg-white shadow-xl p-8 rounded-2xl">
          <h1 className="text-2xl font-bold mb-8">Atur Event</h1>

          {/* Toggle segmented */}
          <div className="flex w-fit rounded-xl overflow-hidden border mb-10">
            <button onClick={() => setActiveTab("kategori")} className={`px-6 py-2 font-semibold ${activeTab === "kategori" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              Kategori Event
            </button>
            <button onClick={() => setActiveTab("venue")} className={`px-6 py-2 font-semibold ${activeTab === "venue" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              Venue Event
            </button>
          </div>

          {/* ---------------- PAGE KATEGORI EVENT ---------------- */}
          {activeTab === "kategori" && (
            <div>
              <div className="flex gap-3 mb-6">
                <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nama Kategori Baru" className="border px-4 py-2 rounded w-full" />
                <button onClick={addCategory} className="bg-blue-600 text-white px-6 rounded-lg">Tambah</button>
              </div>

              {categories.map((cat) => (
                <div key={cat.id} className="border rounded-lg p-4 mb-4 bg-white relative">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer"
                      onClick={() =>
                        setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, open: !c.open } : c)))
                      }
                    >
                      <ChevronRight size={20} className={`transition ${cat.open ? "rotate-90" : ""}`} />
                      <span className="font-semibold text-lg">{cat.name}</span>
                    </div>

                    <button
                      id={`menu-${cat.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, menu: !c.menu } : { ...c, menu: false })));
                      }}
                      className="hover:text-blue-600"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {cat.menu && (
                      <div
                        className="absolute right-4 top-12 bg-white shadow-lg border rounded-lg w-44 py-2 z-30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                          onClick={() => openSubModal(cat)}
                        >
                          ➕ Tambah Subkategori
                        </button>
                        <button className="block px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left"
                          onClick={() => deleteCategory(cat.id)}
                        >
                          <Trash2 size={15} className="inline mr-2" /> Hapus Kategori
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Subkategori */}
                  {cat.open && cat.subcategories.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {cat.subcategories.map((sub) => (
                        <div key={sub} className="ml-6 border px-3 py-2 rounded-lg bg-gray-50 flex justify-between items-center">
                          <span>{sub}</span>
                          <button className="hover:text-red-600 flex items-center gap-1 text-sm"
                            onClick={() => {
                              if (confirm("Hapus subkategori?")) deleteSubcategory(cat.id, sub);
                            }}
                          >
                            <Trash2 size={15} /> Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ---------------- PAGE VENUE EVENT ---------------- */}
{activeTab === "venue" && (
  <div>
    {/* Search (kiri) + Tambah Venue (kanan) */}
    <div className="flex items-center justify-between mb-6">
      <input
        type="text"
        placeholder="Cari venue..."
        value={searchVenue}
        onChange={(e) => setSearchVenue(e.target.value)}
        className="border px-4 py-2 rounded w-60"   // searchbar pendek
      />
      <button
        onClick={openAddVenue}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg"
      >
        Tambah Venue
      </button>
    </div>

    {/* Tabel Venue (sudah realtime filter) */}
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-100 border text-left">
          <th className="p-3">Nama Venue</th>
          <th className="p-3">Kecamatan</th>
          <th className="p-3">Alamat</th>
          <th className="p-3 text-center">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {venues
          .filter(v =>
            v.name.toLowerCase().includes(searchVenue.toLowerCase()) ||
            v.district.toLowerCase().includes(searchVenue.toLowerCase()) ||
            v.address.toLowerCase().includes(searchVenue.toLowerCase())
          )
          .map((v) => (
            <tr key={v.id} className="border-b">
              <td className="p-3">{v.name}</td>
              <td className="p-3">{v.district}</td>
              <td className="p-3">{v.address}</td>
              <td className="p-3 text-center space-x-4">
                <button
                  onClick={() => openEditVenue(v)}
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <Pencil size={15} /> Edit
                </button>
                <button
                  onClick={() => deleteVenue(v.id)}
                  className="text-red-600 hover:underline inline-flex items-center gap-1"
                >
                  <Trash2 size={15} /> Hapus
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>

    {/* Modal ADD / EDIT VENUE */}
    {modalOpen && (
      <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-40">
        <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
          <h2 className="text-xl font-semibold">
            {editMode ? "Edit Venue" : "Tambah Venue Baru"}
          </h2>

          <input
            type="text"
            className="border px-4 py-2 rounded w-full"
            placeholder="Nama Venue"
            value={venueForm.name}
            onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
          />
          <input
            type="text"
            className="border px-4 py-2 rounded w-full"
            placeholder="Kecamatan"
            value={venueForm.district}
            onChange={(e) => setVenueForm({ ...venueForm, district: e.target.value })}
          />
          <textarea
            className="border px-4 py-2 rounded w-full"
            placeholder="Alamat"
            value={venueForm.address}
            onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })}
          />

          <div className="flex justify-end gap-3">
            <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setModalOpen(false)}>
              Batal
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={editMode ? saveVenueChanges : addVenue}
            >
              {editMode ? "Simpan Perubahan" : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}


          {/* Modal Tambah Subkategori */}
          {subModalOpen && (
            <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
                <h2 className="text-xl font-semibold">
                  Tambah Subkategori dari {selectedCategory?.name}
                </h2>

                <input
                  type="text"
                  value={newSub}
                  onChange={(e) => setNewSub(e.target.value)}
                  placeholder="Nama Subkategori"
                  className="border px-4 py-2 rounded w-full"
                />

                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 bg-gray-300 rounded"
                    onClick={() => setSubModalOpen(false)}
                  >
                    Batal
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={saveSubcategory}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
