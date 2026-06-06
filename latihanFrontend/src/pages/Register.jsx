import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

function Register() { 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '', 
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/register', formData);

      toast.success('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message ||
                      error.response?.data?.errors?.email?.[0] ||
                      'Registrasi gagal! Cek kembali data yang anda masukkan.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-teal-300 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h1>
        <p className="text-center text-gray-600 mb-6">Buat akun baru anda.</p>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name Lengkap</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 
              focus:ring-green-400"
              placeholder="Nama Anda"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 
              focus:ring-green-400"
              placeholder="contoh@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 
              focus:ring-green-400"
              placeholder="minimal 8 karakter"
              required
            />
          </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Konfirmasi Password</label>
              <input 
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 
                focus:ring-green-400"
                placeholder="konfirmasi password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-200 disabled:opacity-50 mt-6"
            >
              {loading ? "Mendaftarkan..." : "Daftar"}
            </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-green-600 hover:underline font-medium">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );

}
export default Register;