// frontend/src/pages/tenant/Payments.jsx
import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";

const Payments = () => {
  const [history, setHistory] = useState([]);
  const [due, setDue] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const token = localStorage.getItem("token");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const [hRes, dRes] = await Promise.all([
        fetch("http://localhost:5000/api/payments/my", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/payments/due", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const hData = await hRes.json();
      const dData = await dRes.json();
      setHistory(hData.payments || []);
      setDue(dData.due || null);
    } catch {
      setMsg({ type: "error", text: "Failed to load payments" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const payNow = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/payments/pay-rent", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Payment failed");
      setMsg({ type: "success", text: "Payment success!" });
      setAmount("");
      fetchPayments();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };

  const totalPaid = useMemo(
    () => history.reduce((acc, p) => acc + (p.amount || 0), 0),
    [history]
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="max-w-7xl mx-auto w-full px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600">Pay rent, view invoices and history</p>
          </div>

          {msg && (
            <div
              className={`mb-4 rounded-lg p-3 text-sm ${
                msg.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {msg.text}
            </div>
          )}

          {/* Summary Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border rounded-xl p-5">
              <p className="text-gray-500">Total Paid</p>
              <p className="text-3xl font-bold text-indigo-700">₹{totalPaid}</p>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <p className="text-gray-500">Current Due</p>
              <p className="text-3xl font-bold text-rose-600">
                ₹{due?.amount || 0}
              </p>
              {due && (
                <p className="text-xs text-gray-500 mt-1">
                  Next due date: {new Date(due.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="bg-white border rounded-xl p-5">
              <p className="text-gray-500">Last Payment</p>
              <p className="text-lg font-semibold">
                {history[0]
                  ? `${new Date(history[0].createdAt).toLocaleDateString()} (₹${history[0].amount})`
                  : "—"}
              </p>
            </div>
          </section>

          {/* Pay Form */}
          <section className="bg-white border rounded-xl p-6 mb-10">
            <h2 className="text-xl font-bold mb-4">Pay Rent</h2>
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-sm text-gray-700">Amount</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Method</label>
                <select className="w-full border rounded-lg px-3 py-2">
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Netbanking</option>
                </select>
              </div>
              <button
                onClick={payNow}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg"
              >
                Pay Now
              </button>
            </div>
          </section>

          {/* History */}
          <section>
            <h2 className="text-xl font-bold mb-4">Payment History</h2>
            {loading ? (
              <div className="py-10 text-gray-500">Loading...</div>
            ) : history.length === 0 ? (
              <div className="bg-white border rounded-xl p-8 text-gray-600">
                No payments yet
              </div>
            ) : (
              <div className="overflow-x-auto bg-white border rounded-xl">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">PG</th>
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((p) => (
                      <tr key={p._id} className="border-t">
                        <td className="p-3">
                          {new Date(p.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3">{p.pg?.title || "—"}</td>
                        <td className="p-3 font-semibold">₹{p.amount}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-green-100 text-green-700">
                            {p.status || "Success"}
                          </span>
                        </td>
                        <td className="p-3">
                          <a
                            className="text-indigo-600 hover:underline"
                            href={`http://localhost:5000/api/payments/${p._id}/invoice`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Payments;
