import { useState } from "react";
import api from "../../services/api";

const formatRupiah = (number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);

export default function PaymentModal({ cart, total, user, token, onClose, onSuccess }) {
    const [step, setStep] = useState('customer'); // customer | payment
    const [phoneInput, setPhoneInput] = useState('');
    const [lookingUp, setLookingUp] = useState(false);
    const [pelanggan, setPelanggan] = useState(null);
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ nama: '', no_hp: '', alamat: '' });
    const [skipCustomer, setSkipCustomer] = useState(false);

    const [bayar, setBayar] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [errors, setErrors] = useState({});

    const DISCOUNT_MEMBER = 5;
    const isMember = pelanggan && !isNewCustomer;
    const discountAmount = isMember ? Math.round(total * DISCOUNT_MEMBER / 100) : 0;
    const totalAfterDiscount = total - discountAmount;

    const nominalBayar = parseInt(bayar.replace(/\D/g, ''), 10) || 0;
    const kembalian = nominalBayar - totalAfterDiscount;

    // praktikum 11 - tambah handlePhoneLookup
    const handlePhoneLookup = async () => {
        if (!phoneInput.trim()) return;
        setLookingUp(true);
        setErrorMsg('');
        setPelanggan(null);
        setIsNewCustomer(false);

        try {
            const res = await api.get(`/pelanggan/phone/${phoneInput}`);
            setPelanggan(res.data.data);
            setIsNewCustomer(false);
        } catch {
            // tidak ditemukan -> tampilkan form baru
            setIsNewCustomer(true);
            setNewCustomer({ nama: '', no_hp: phoneInput, alamat: '' });
        } finally {
            setLookingUp(false);
        }
    };

    // const handleBayar = async () => {
    //     if (nominalBayar < total) { setError('Nominal pembayaran kurang!'); return; }
    //     setLoading(true);
    //     setError('');
    //     try {
    //         const payload = {
    //             user_id: user.id,
    //             shipping_address: 'Kasir POS',
    //             items: cart.map((i) => ({
    //                 produk_id: i.produk_id,
    //                 quantity: i.quantity,})),
    //         };
    //         const res = await axios.post(`${BASE_URL}/orders`, payload, {
    //             headers: { Authorization: `Bearer ${token}` },
    //         });
    //         onSuccess({ ...res.data.data, bayar: nominalBayar, kembalian });
    //     } catch (err) {
    //         setError(err.response?.data?.message || 'Gagal membuat transaksi.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // praktikum 11 - update handleBayar
    const handleBayar = async () => {
        if (nominalBayar < totalAfterDiscount) {
            setErrorMsg('Nominal pembayaran kurang!');
            return;
        }

        setLoading(true);
        setErrors({});
        setErrorMsg('');

        try {
            let pelangganId = pelanggan?.id || null;

            // buat pelanggan baru jika diperlukan
            if (isNewCustomer && newCustomer.nama && newCustomer.no_hp) {
                const createRes = await api.post('/pelanggan', newCustomer);
                pelangganId = createRes.data.data.id;
            }

            const payload = {
                user_id: user?.id,
                pelanggan_id: pelangganId,
                shipping_address: pelanggan?.alamat || newCustomer.alamat || 'Kasir POS',
                items: cart.map((i) => ({
                    produk_id: i.produk_id,
                    quantity: i.quantity,
                })),
            };

            const res = await api.post('/orders', payload);

            onSuccess({
                ...res.data.data,
                bayar: nominalBayar,
                kembalian,
                discountAmount,
            });
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
                setErrorMsg(Object.values(err.response.data.errors)[0]?.[0] || 'Validasi gagal.');
            } else {
                setErrorMsg(err.response?.data?.message || 'Gagal membuat transaksi.');
            }
        } finally {
            setLoading(false);
        }
    };


    // const quickAmounts = [
    //     Math.ceil(total / 10000) * 10000,
    //     Math.ceil(total / 50000) * 50000,
    //     Math.ceil(total / 100000) * 100000,
    // ].filter((v, i, a) => a.indexOf(v) === i );

    // praktikum 11 - update quickAmounts dengan diskon
    const quickAmounts = [...new Set([
        Math.ceil(totalAfterDiscount / 10000) * 10000,
        Math.ceil(totalAfterDiscount / 50000) * 50000,
        Math.ceil(totalAfterDiscount / 100000) * 100000,
    ])].filter((v) => v >= totalAfterDiscount).slice(0, 3); // ambil maksimal 3 opsi yang lebih besar atau sama dengan total setelah diskon

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">💳 Proses Pembayaran</h2>

                {/* Ringkasan */}
                <div className="mb-4 p-4 bg-gray-50 rounded-xl space-y-2">
                    {cart.map((item) => (
                        <div key={item.produk_id} className="flex justify-between text-sm">
                            <span>{item.nama} x {item.quantity}</span>
                            <span>{formatRupiah(item.harga * item.quantity)}</span>
                        </div>
                    ))}
                    <hr />
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span>{formatRupiah(total)}</span>
                    </div>
                    {isMember && (
                        <div className="flex justify-between text-sm text-green-600 font-semibold">
                            <span>Diskon Member 5%</span>
                            <span>- {formatRupiah(discountAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total Bayar</span>
                        <span className="text-blue-600">{formatRupiah(totalAfterDiscount)}</span>
                    </div>
                </div>

                {/* --- section : data pelanggan --- */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold text-sm">🗿 Data Pelanggan</p>
                        {!skipCustomer && !pelanggan && !isNewCustomer && (
                            <button
                                onClick={() => setSkipCustomer(true)}
                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                            >
                                Lewati (lewat member)
                            </button>
                        )}
                        {(skipCustomer || pelanggan || isNewCustomer) && (
                            <button
                                onClick={() => {
                                    setSkipCustomer(false);
                                    setPelanggan(null);
                                    setIsNewCustomer(false);
                                    setPhoneInput('');
                                }}
                                className="text-xs text-blue-500 hover:underline"
                            >
                                Ubah
                            </button>
                        )}
                    </div>

                    {/* Sudah skip */}
                    {skipCustomer && !pelanggan && !isNewCustomer && (
                        <div className="bg-gray-100 p-3 rounded-xl text-center text-sm text-gray-500">
                            transaksi tanpa data pelanggan
                        </div>
                    )}

                    {/* bwlum cek phone */}
                    {!skipCustomer && !pelanggan && !isNewCustomer && (
                        <div className="flex gap-2">
                            <input
                                type="tel"
                                placeholder="Masukkan nomor HP pelanggan"
                                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handlePhoneLookup()}
                            />
                            <button
                                onClick={handlePhoneLookup}
                                disabled={lookingUp || !phoneInput}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                                {lookingUp ? '...' : 'Cek'}
                            </button>
                        </div>
                    )}

                    {/* Pelanggan ditemukan */}
                    {pelanggan && !isNewCustomer && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-green-700">✅ Member ditemukan!</p>
                                    <p className="text-sm font-semibold">{pelanggan.nama}</p>
                                    <p className="text-xs text-gray-500">{pelanggan.no_hp}</p>
                                    {pelanggan.alamat && (
                                        <p className="text-xs text-gray-500">{pelanggan.alamat}</p>
                                    )}
                                </div>
                                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    Diskon 5%
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Pelanggan tidak ditemukan -> form baru */}
                    {isNewCustomer && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 space-y-2">

                            <p className="text-sm font-semibold text-yellow-700">
                                ⚠️ Pelanggan belum terdaftar. Daftarkan sekarang?
                            </p>

                            <input
                                type="text"
                                placeholder="Nama lengkap *"
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                value={newCustomer.nama}
                                onChange={(e) => setNewCustomer({ ...newCustomer, nama: e.target.value })}
                            />

                            <input
                                type="tel"
                                placeholder="No. HP *"
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                value={newCustomer.no_hp}
                                onChange={(e) => setNewCustomer({ ...newCustomer, no_hp: e.target.value, })}
                            />

                            <input
                                type="text"
                                placeholder="Alamat (opsional)"
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                value={newCustomer.alamat}
                                onChange={(e) => setNewCustomer({ ...newCustomer, alamat: e.target.value, })}
                            />

                            <p className="text-xs text-gray-400">
                                * Akan otomatis didaftarkan saat transaksi berhasil. Belum mendapat diskon member.
                            </p>
                        </div>
                    )}
                </div>

                {/* Input Pembayaran */}
                <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Nominal Bayar</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Masukkan Nominal..."
                        className="w-full border-2 rounded-xl px-4 py-3 text-xl font-bold focus:outline-none 
                        focus:border-blue-500"
                        value={bayar ? `Rp ${parseInt(bayar.replace(/\D/g, ''), 10).toLocaleString('id-ID')}` :
                            ''}
                        onChange={(e) => setBayar(e.target.value.replace(/\D/g, ''))}
                    />
                </div>

                {/* Quick Amounts */}
                {quickAmounts.length > 0 && (
                    <div className="mb-4 flex gap-2">
                        {quickAmounts.map((amt) => (
                            <button
                                key={amt}
                                onClick={() => setBayar(String(amt))}
                                className="flex-1 py-2 border rounded-lg text-sm hover:bg-blue-50 hover:border-blue-400"
                            >
                                {formatRupiah(amt)}
                            </button>
                        ))}
                    </div>
                )}


                {/* Kembalian */}
                {nominalBayar >= totalAfterDiscount && nominalBayar > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-center">
                        <p className="text-sm text-green-700">Kembalian</p>
                        <p className="text-2xl font-bold text-green-600">{formatRupiah(kembalian)}</p>
                    </div>
                )}

                {/* error */}
                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <p className="text-red-600 text-sm">{errorMsg}</p>
                        {Object.entries(errors).map(([field, messages]) => (
                            <p key={field} className="text-red-500 text-xs mt-1">● {field}: {messages[0]}</p>
                        ))}
                    </div>
                )}

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2 border rounded-xl hover:bg-gray-50 font-medium">
                        Batal
                    </button>
                    <button
                        onClick={handleBayar}
                        disabled={loading || nominalBayar < totalAfterDiscount}
                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 
                        disabled:opacity-50"
                    >
                        {loading ? 'Memproses...' : '✅ Bayar'}
                    </button>
                </div>
            </div>
        </div>
    );
}