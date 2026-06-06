import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Perbaikan: useNavigate
import api from "../services/api";
import toast from "react-hot-toast";

const ProductImage = ({ src, alt, className, fallbackSize = "text-4xl" }) => {
  const [hasError, setHasError] = useState(false);
  const isInvalid = !src || src === "null" || src.endsWith("/null") || src.endsWith("/storage/");

  if (isInvalid || hasError) {
    return <span className={fallbackSize}>📦</span>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [selectedProduk, setSelectedProduk] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Perbaikan: useNavigate

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user');
        setUser(response.data);
      } catch (error) {
        toast.error('Sesi habis, silahkan login lagi.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUser();
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/produks');
      let data = response.data;
      if (data.data) data = data.data; 
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Gagal memuat produk.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (error) {}
    localStorage.removeItem('token');
    toast.success('Logout berhasil!');
    navigate('/login');
  };

  const openDetail = (produk) => {
    setSelectedProduk(produk);
    setEditForm({ ...produk });
  };

  const closeDetail = () => {
    setSelectedProduk(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const updateProduk = async () => {
    try {
      const { kodeBarang, gambar, ...dataToUpdate } = editForm;
      await api.put(`/produks/${editForm.id}`, dataToUpdate);
      toast.success('Produk berhasil diupdate!');
      closeDetail();
      fetchProducts();
    } catch (error) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        const firstError = Object.values(errors).flat()[0];
        toast.error(firstError || 'Gagal update produk.');
      } else {
        toast.error('Gagal update produk.');
      }
    }
  };

  // Perbaikan: Pakai 'products' bukan 'produks' & tambah 'const'
  const filteredProduks = products.filter(produk => {
    const matchesSearch = produk.namaBarang.toLowerCase().includes(search.toLowerCase()) ||
                          produk.kodeBarang.toLowerCase().includes(search.toLowerCase());
    const matchesKategori = !kategoriFilter || produk.kategori === kategoriFilter;
    return matchesSearch && matchesKategori;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar - Mengikuti style minimalis lo sebelumnya */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-1.5 flex justify-between items-center">
          <h1 className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] cursor-pointer" onClick={() => navigate('/dashboard')}>
            Laravel <span className="font-black text-gray-600">POS</span>
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">
              User: <span className="text-gray-800 font-medium">{user?.name}</span>
            </span>
            <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Daftar Produk</h2>
            <p className="text-xs text-gray-500">{filteredProduks.length} Produk ditemukan</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 md:w-64 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <select
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Semua Kategori</option>
              <option value="Software">Software</option>
              <option value="Hardware">Hardware</option>
              <option value="Storage">Storage</option>
              <option value="Aksesoris">Aksesoris</option>
              <option value="Elektronik">Elektronik</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
          {filteredProduks.map(produk => (
            <div 
              key={produk.id}
              onClick={() => openDetail(produk)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer border border-gray-100"
            >
              <div className="h-36 bg-gray-50 flex items-center justify-center">
                <ProductImage
                  src={produk.gambar}
                  alt={produk.namaBarang}
                  className="w-full h-full object-cover"
                  fallbackSize="text-2xl"
                />
              </div>
              <div className="p-2">
                <div className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">{produk.kodeBarang}</div>
                <h3 className="font-bold text-xs text-gray-800 mt-0.5 line-clamp-1" title={produk.namaBarang}>{produk.namaBarang}</h3>
                <div className="text-xs font-bold text-blue-600 mt-0.5">
                  Rp {parseInt(produk.harga).toLocaleString('id-ID')}
                </div>
                <div className="flex justify-between items-center mt-1.5 gap-1">
                  <span className="text-[8px] px-1 py-0.5 bg-gray-100 text-gray-600 rounded font-bold uppercase" title={produk.kategori}>
                    {produk.kategori}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap">Stok: {produk.stok || produk.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Detail Produk */}
      {selectedProduk && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <h2 className="text-lg font-bold mb-6 text-gray-800">Detail & Edit Produk</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-2xl flex items-center justify-center p-4">
                  <ProductImage
                    src={selectedProduk.gambar}
                    alt={selectedProduk.namaBarang}
                    className="w-full rounded-xl shadow-sm"
                    fallbackSize="text-6xl"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kode Barang</label>
                    <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-500 font-mono mt-1 italic">
                      {selectedProduk.kodeBarang}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama Barang</label>
                    <input type="text" name="namaBarang" value={editForm.namaBarang || ''} onChange={handleEditChange} className="w-full border-b border-gray-200 py-2 text-sm focus:border-blue-500 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Harga (Rp)</label>
                      <input type="number" name="harga" value={editForm.harga || ''} onChange={handleEditChange} className="w-full border-b border-gray-200 py-2 text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stok</label>
                      <input type="number" name="stok" value={editForm.stok || editForm.quantity || ''} onChange={handleEditChange} className="w-full border-b border-gray-200 py-2 text-sm focus:border-blue-500 outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kategori</label>
                    <select name="kategori" value={editForm.kategori || ''} onChange={handleEditChange} className="w-full border-b border-gray-200 py-2 text-sm focus:border-blue-500 outline-none bg-transparent">
                      <option value="Software">Software</option>
                      <option value="Hardware">Hardware</option>
                      <option value="Storage">Storage</option>
                      <option value="Aksesoris">Aksesoris</option>
                      <option value="Elektronik">Elektronik</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <button onClick={updateProduk} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">SIMPAN</button>
                    <button onClick={closeDetail} className="flex-1 bg-gray-100 text-gray-500 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-200 transition">BATAL</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;