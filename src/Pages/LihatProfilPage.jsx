import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";

export default function LihatProfilPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const getRoleDisplayName = (role) => {
    switch(role) {
      case 'user': return 'User';
      case 'organizer': return 'Event Organizer';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">

          <h2 className="text-2xl font-bold mb-6">Profil Saya</h2>
          
          {user ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <p className="text-lg">{user.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <p className="text-lg capitalize">{getRoleDisplayName(user.role)}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Memuat data profil...</p>
          )}

        </div>
      </div>
    </div>
  );
}