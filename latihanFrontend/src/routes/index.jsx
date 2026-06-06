import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ProductList from '../pages/ProductList';
import POSPage from '../pages/POSPage';
import PesananPage from '../pages/PesananPage';
import PelangganPage from '../pages/PelangganPage';
import PembelianList from '../pages/PembelianList';

function MainRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/produk" element={<ProductList />} />
      <Route path="/pos" element={<POSPage />} />
      <Route path="/pesanan" element={<PesananPage />} />
      <Route path="/pelanggan" element={<PelangganPage />} />
      <Route path="/pembelian" element={<PembelianList />} />
      {/* nanti di tambah route lain (order, profile, dll) */}
    </Routes>
  );
}

export default MainRoutes;