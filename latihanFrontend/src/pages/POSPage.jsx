import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { STORAGE_URL } from "../services/api";
import PaymentModal from "../components/pos/PaymentModal";
import ReceiptModal from "../components/pos/ReceiptModal";


const formatRupiah = (number) =>
    new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0, 
    }).format(number);

const ProductImage = ({ src, alt, className }) => {
    const [hasError, setHasError] = useState(false);
    const isInvalid = !src || src === "null" || src.endsWith("/null") || src.endsWith("/storage/");

    if (isInvalid || hasError) {
        return <span className="text-4xl">📦</span>;
    }

    const fullSrc = src.startsWith('http') ? src : `${STORAGE_URL}/${src}`;

    return (
        <img
            src={fullSrc}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
        />
    );
};

export default function POSPage() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');
    const [kategori, setKategori] = useState('Semua');
    const [categories, setCategories] = useState(['Semua']);
    const [loading, setLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrentUser();
        fetchProducts();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const res = await api.get('/user');
            setCurrentUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
        } catch (err) {
            console.error("Gagal mengambil data user:", err);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get('/produks');
            const data = res.data.data || res.data;
            setProducts(data);
            const cats = ['Semua', ...new Set(data.map((p) => p.kategori).filter(Boolean))];
            setCategories(cats);
        } catch (err) {
            console.error("Gagal mengambil produk:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter((p) => {
        const matchSearch = p.namaBarang?.toLowerCase().includes(search.toLowerCase());
        const matchKategori = kategori === 'Semua' || p.kategori === kategori;
        return matchSearch && matchKategori;
    });

    const addToCart = (product) => {
        if (product.stok <= 0) return;
        setCart((prev) => {
            const existing = prev.find((i) => i.produk_id === product.id);
            if (existing) { 
                if (existing.quantity < product.stok) return prev;
                return prev.map((i) => i.produk_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, {
                produk_id: product.id,
                nama: product.namaBarang,
                harga: product.harga,
                quantity: 1,
                stok: product.stok,
            }];
    });
};

const updateQty = (produk_id, qty) => {
    if (qty < 1) {
        removeFromCart(produk_id);
        return;
    }
    setCart((prev) =>
        prev.map((i) => {
            if (i.produk_id !== produk_id) return i;
            if (qty > i.stok) return i;
            return { ...i, quantity: qty };
        })
    );
};

const removeFromCart = (produk_id) => {
    setCart((prev) => prev.filter((i) => i.produk_id !== produk_id));
};

const clearCart = () => setCart ([]);

const total = cart.reduce((sum, i) => sum + i.harga * i.quantity, 0);

const handleOrderSuccess = (orderData) => {
    setLastOrder(orderData);
    setShowPayment(false);
    setShowReceipt(true);
    clearCart();
};

return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
        {/* panel kiri - produk*/}
        <div className="flex flex-col flex-1 p-4 overflow-hidden">
            {/* header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold">🛒 Kasir / Point Of Sale</h1>
                    <p className="text-sm text-gray-500">
                        Kasir: <span className="font-semibold">{currentUser?.name || '...'}!</span>
                    </p>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 border bg-gray-300 rounded-lg hover:bg-gray-200 text-sm transition">
                    ← Kembali
                </button>
            </div>

            {/* search & filter */}
            <div className="flex gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Cari produk..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="px-4 py-2 border rounded-lg focus:outline-none"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                >
                    {categories.map((c) => (
                        <option key={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* grid produk */}

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
                    Memuat produk...
                </div>
            ) : (
                <div className="flex-1 overflow-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start p-4 w-full">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className={`bg-white rounded-xl p-3 shadow-sm cursor-pointer border-2 
                                border-transparent transition-all hover:shadow-md hover:border-blue-400 
                                ${product.stok <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                        
                        <div className="w-full h-28 bg-gray-100 rounded-lg overflow-hidden mb-2 flex items-center justify-center">
                            <ProductImage
                                src={product.gambar}
                                alt={product.namaBarang}
                                className="object-cover h-full w-full"
                            />
                        </div>
                        <p className="text-xs text-gray-400">{product.kodeBarang}</p>
                        <p className="font-semibold text-sm truncate">{product.namaBarang}</p>
                        <p className="text-blue-600 font-bold text-sm">{formatRupiah(product.harga)}</p>
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                {product.kategori}
                            </span>
                            <span className={`text-xs ${
                                product.stok <= 0 ? 'text-red-600 font-bold' : 'text-gray-500'
                            }`}>
                                {product.stok <= 0 ? 'Habis' : `Stok: ${product.stok}`}
                            </span>
                        </div>
                    </div>
                ))}
                {filteredProducts.length === 0 && (
                    <div className="col-span-4 text-center text-gray-500 py-12">
                        Produk tidak ditemukan
                    </div>
                )}
            </div>
            )}
        </div>

        {/* panel kanan - cart */}
        <div className="w-72 bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b bg-blue-600 text-white">
                <h2 className="text-lg font-bold !text-white">🛒 Keranjang Belanja</h2>
                <p className="text-sm opacity-80">{cart.length} item dipilih</p>
            </div>

            {/* List item keranjang */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
                {cart.length === 0 ? (
                    <div className="text-center text-gray-500 py-16">
                        <p className="text-4xl mb-3">🛒</p>
                        <p className="text-sm">Klik produk untuk menambah ke keranjang</p>
                    </div>
                ) : (
                    cart.map((item) => (
                        <div key={item.produk_id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                            
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{item.nama}</p>
                                <p className="text-sm text-blue-500">{formatRupiah(item.harga)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => updateQty(item.produk_id, item.quantity - 1)}
                                    className="w-7 h-7 bg-gray-200 rounded-full text-sm font-bold hover:bg-red-100 flex items-center justify-center transition">
                                    -
                                    </button>
                                <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                <button
                                    onClick={() => updateQty(item.produk_id, item.quantity + 1)}
                                    className="w-7 h-7 bg-gray-200 rounded-full text-sm font-bold hover:bg-green-100 flex items-center justify-center transition">
                                    +
                                    </button>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-sm">{formatRupiah(item.harga * item.quantity)}</p>
                                <button
                                    onClick={() => removeFromCart(item.produk_id)}
                                    className="text-xs text-red-400 hover:text-red-600">
                                    Hapus
                                    </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* Footer Keranjang */}
            <div className="p-4 border-t space-y-3 bg-gray-50">
                <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{formatRupiah(total)}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={clearCart}
                        disabled={cart.length === 0}
                        className="flex-1 py-2 border border-red-400 text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium transition">
                            Batal   
                    </button>
                    <button
                        onClick={() => setShowPayment(true)}
                        disabled={cart.length === 0 || !currentUser}
                        className="flex-1 py-2 border border-red-400 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium transition">
                            💳 Bayar
                    </button>
                </div>
            </div>
        </div>

        {/* Modal Pembayaran */}
        {showPayment && (
            <PaymentModal
                cart={cart}
                total={total}
                user={currentUser}
                token={token}
                onClose={() => setShowPayment(false)}
                onSuccess={handleOrderSuccess}
            />
        )}

        {/* Modal Struk */}
        {showReceipt && lastOrder && (
            <ReceiptModal
                order={lastOrder}
                onClose={() => setShowReceipt(false)}
            />  
        )}
    </div>
);
}
               


