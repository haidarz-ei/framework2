import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user');
        setUser(response.data);
      } catch (error) {
        toast.error('Sesi habis, silahkan login lagi.');
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {}
    localStorage.removeItem('token');
    toast.success('Logout berhasil!');
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>; 

  return (
<div className="min-h-screen bg-gray-50">
      {/* Navbar - py-0.5 biar bener-bener mepet dan minimalis */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-0.5 flex justify-between items-center">
          
          {/* Laravel POS - Ukuran diperkecil (text-[10px]) dan warna diperhalus */}
          <h1 className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
            Laravel <span className="font-black text-gray-600">POS</span>
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Halo, <span className="font-semibold text-gray-800">{user?.name}</span>
            </span>
            <button 
              onClick={handleLogout} 
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Konten Utama - Padding atas dikurangi dari py-10 ke py-6 */}
      <div className="max-w-7xl mx-auto px-6 py-6"> 
        {/* Judul Dashboard dikecilkan dari text-3xl ke text-xl */}
        <h2 className="text-xl font-bold mb-6 text-gray-800">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          { /* POS - Utama */ }
          <div 
            onClick={() => navigate('/pos')}
            className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-8 rounded-3xl shadow-lg hover:scale-105 transition-all cursor-pointer lg:col-span-2"
          >
            <div className="text-5xl mb-4">🤑</div>
            <h3 className="text-2xl font-bold mb-1">Point of Sale</h3>
            <p className="text-indigo-100 text-base">Mulai transaksi penjualan sekarang</p>
            <div className="mt-4 text-xs opacity-75">→ Klik untuk buka kasir</div>
          </div>

          { /* Produk */ }
          <div
            onClick={() => navigate('/produk')}
            className="bg-white p-8 rounded-3xl shadow hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
          > 
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-1 text-gray-800">Produk</h3>
            <p className="text-sm text-gray-500">Kelola stok & daftar barang</p>
          </div>

          { /* Pembelian */ }
          <div
            onClick={() => navigate('/pembelian')}
            className="bg-white p-8 rounded-3xl shadow hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
          >
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold mb-1 text-gray-800">Pembelian</h3>
            <p className="text-sm text-gray-500">Riwayat pembelian barang</p>
          </div>

          { /* Pesanan */ }
          <div
            onClick={() => navigate('/pesanan')}
            className="bg-white p-8 rounded-3xl shadow hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-1 text-gray-800">Pesanan</h3>
            <p className="text-sm text-gray-500">Riwayat transaksi penjualan</p>
          </div>

          { /* Pelanggan */ }
          <div
            onClick={() => navigate('/pelanggan')}
            className="bg-white p-8 rounded-3xl shadow hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
          >
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-1 text-gray-800">Pelanggan</h3>
            <p className="text-sm text-gray-500">Data pelanggan & loyalty</p>
          </div>

          { /* Profil */ }
          <div
            onClick={() => navigate('/profile')}
            className="bg-white p-8 rounded-3xl shadow hover:shadow-xl transition-all hover:scale-105 cursor-pointer" 
          >
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-semibold mb-1 text-gray-800">Profil</h3>
            <p className="text-sm text-gray-500">Pengaturan akun</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;