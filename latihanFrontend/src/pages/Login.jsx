import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/login", { 
        email, 
        password 
      });

      // simpan token
      localStorage.setItem("token", response.data.token);
      // simpan user info (opsional, bisa juga diambil dari /user endpoint)
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      toast.success("Login berhasil!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login gagal! Cek kembali email dan password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-indigo-300 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h1>
        <p className="text-center text-gray-600 mb-6">Masuk ke akun anda.</p>
        
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 
              focus:ring-blue-400"
              placeholder="contoh@gmail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 
              focus:ring-blue-400"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? "Sedang Loading..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Belum punya akun?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;