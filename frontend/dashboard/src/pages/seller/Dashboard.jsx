/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const CardLoader = () => (
  <div className="card-loader">
    <div className="spinner"></div>
  </div>
);

export default function Dashboard() {
  const [range, setRange] = useState("today");
  const [shop, setShop] = useState(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [fbSpend, setFbSpend] = useState(0); // 💰 Facebook spend
  const [googleSpend, setGoogleSpend] = useState(0); // 💰 Google spend
  const [loading, setLoading] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [fbLoading, setFbLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderAnalytics, setOrderAnalytics] = useState([]);
  const [adAnalytics, setAdAnalytics] = useState([]);
  const [metric, setMetric] = useState("orders"); // orders | revenue
  const [last7DaysData, setLast7DaysData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [fbSpendAnalytics, setFbSpendAnalytics] = useState([]);
  const [fbChartLoading, setFbChartLoading] = useState(false);
  const [googleSpendAnalytics, setGoogleSpendAnalytics] = useState([]);
  const [googleChartLoading, setGoogleChartLoading] = useState(false);

  const token = localStorage.getItem("token");

  const totalAdsSpend = Number(fbSpend || 0) + Number(googleSpend || 0);

  const cpp = totalRevenue > 0 ? totalAdsSpend / totalRevenue : 0;

  const cpo = totalOrders > 0 ? totalAdsSpend / totalOrders : 0;

  //   console.log(orders);
  // 🔹 Fetch shop details
  // 🔹 Fetch Google Ads spend whenever range or customDates changes
  useEffect(() => {
    const fetchLast7DaysGoogleSpend = async () => {
      try {
        setGoogleChartLoading(true);

        const res = await fetch(
          "http://localhost:5000/api/seller/last7days-googlespend",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();
        setGoogleSpendAnalytics(data || []);
      } catch (err) {
        console.error("Google spend chart error", err);
        setGoogleSpendAnalytics([]);
      } finally {
        setGoogleChartLoading(false);
      }
    };

    fetchLast7DaysGoogleSpend();
  }, [token]);

  useEffect(() => {
    const fetchLast7DaysFacebookSpend = async () => {
      try {
        setFbChartLoading(true);

        const res = await fetch(
          "http://localhost:5000/api/seller/last7days-facebookspend",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();
        setFbSpendAnalytics(data || []);
      } catch (err) {
        console.error("Facebook spend chart error", err);
        setFbSpendAnalytics([]);
      } finally {
        setFbChartLoading(false);
      }
    };

    fetchLast7DaysFacebookSpend();
  }, [token]);

  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        setOrdersLoading(true);

        let url = `http://localhost:5000/api/seller/orders?filter=${range}`;
        if (range === "custom") {
          url += `&from=${customDates.startDate}&to=${customDates.endDate}`;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        const orders = data.orders || [];

        setTotalOrders(orders.length);

        const revenue = orders.reduce(
          (sum, o) => sum + Number(o.totalPrice || 0),
          0
        );
        setTotalRevenue(revenue);
      } catch {
        setTotalOrders(0);
        setTotalRevenue(0);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrderSummary();
  }, [range, customDates.startDate, customDates.endDate, token]);

  useEffect(() => {
    const fetchOrdersAnalytics = async () => {
      const res = await fetch(
        "http://localhost:5000/api/seller/last7days-orders",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setOrderAnalytics(data);
    };
    fetchOrdersAnalytics();
  }, [token]);

  useEffect(() => {
    const fetchLast7Days = async () => {
      try {
        setChartLoading(true);

        const url =
          metric === "orders"
            ? "http://localhost:5000/api/seller/last7days-orders"
            : "http://localhost:5000/api/seller/last7days-orders-revenue";

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setLast7DaysData(data || []);
      } catch (err) {
        console.error("Chart fetch error", err);
        setLast7DaysData([]);
      } finally {
        setChartLoading(false);
      }
    };

    fetchLast7Days();
  }, [metric, token]);

  useEffect(() => {
    const fetchGoogleSpend = async () => {
      try {
        setGoogleLoading(true);

        let url = `http://localhost:5000/api/seller/google-spend?range=${range}`;
        if (range === "custom") {
          url += `&startDate=${customDates.startDate}&endDate=${customDates.endDate}`;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setGoogleSpend(data.totalSpend || 0);
      } catch {
        setGoogleSpend(0);
      } finally {
        setGoogleLoading(false);
      }
    };

    fetchGoogleSpend();
  }, [range, customDates, token]);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/seller/shop-details",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setShop(data);
      } catch (err) {
        console.error("Shop fetch error:", err.message);
      }
    };
    fetchShop();
  }, [token]);

  // 🔹 Fetch Facebook spend whenever range or customDates changes
  useEffect(() => {
    const fetchFbSpend = async () => {
      try {
        setFbLoading(true);

        let url = `http://localhost:5000/api/seller/facebook-spend?range=${range}`;
        if (range === "custom") {
          url += `&startDate=${customDates.startDate}&endDate=${customDates.endDate}`;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setFbSpend(data.totalSpend || 0);
      } catch {
        setFbSpend(0);
      } finally {
        setFbLoading(false);
      }
    };

    fetchFbSpend();
  }, [range, customDates, token]);

  const handleCustomClick = () => {
    setRange("custom");
    setShowCustomModal(true);
  };

  const handleDateChange = (e) => {
    setCustomDates({ ...customDates, [e.target.name]: e.target.value });
  };

  const handleApplyDates = () => {
    setShowCustomModal(false);
  };

  const handleCloseModal = () => setShowCustomModal(false);
  const mergedAdSpend = fbSpendAnalytics.map((fb) => {
    const google = googleSpendAnalytics.find((g) => g._id === fb._id);
    return {
      date: fb._id,
      facebook: fb.totalSpend,
      google: google?.totalSpend || 0,
    };
  });

  return (
    <div className="app">
      <main className="main">
        <header className="topbar">
          <div>
            <h1>Seller Dashboard</h1>
            <p className="muted">
              Welcome back, {shop?.shop_owner || "Unknown"} •{" "}
              <b>{shop?.name}</b>
            </p>
          </div>
          <div
            className="profile"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <img
              style={{ height: "45px", width: "45px" }}
              src="/vite2.png"
              alt="profile"
            />
            <div className="profile-text">
              <strong>{shop?.shop_owner || "unknown"}</strong>
              <span>{shop?.name || "unknown"}</span>
            </div>
          </div>
        </header>

        {/* Date filters */}
        <section className="filters">
          <button
            onClick={() => setRange("today")}
            className={range === "today" ? "active" : ""}
          >
            Today
          </button>
          <button
            onClick={() => setRange("yesterday")}
            className={range === "yesterday" ? "active" : ""}
          >
            Yesterday
          </button>
          <button
            onClick={handleCustomClick}
            className={range === "custom" ? "active" : ""}
          >
            Custom
          </button>
        </section>

        {/* Custom Modal */}
        {showCustomModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>Select Custom Date Range</h3>
              <div className="date-inputs">
                <label>
                  Start Date:
                  <input
                    type="date"
                    name="startDate"
                    value={customDates.startDate}
                    onChange={handleDateChange}
                  />
                </label>
                <label>
                  End Date:
                  <input
                    type="date"
                    name="endDate"
                    value={customDates.endDate}
                    onChange={handleDateChange}
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button onClick={handleApplyDates}>Apply</button>
                <button onClick={handleCloseModal}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Cards */}
        <section className="cards">
          <div className="card blue">
            <div className="card-header">
              <img
                src="https://pngimg.com/uploads/meta/meta_PNG5.png"
                alt="Meta"
                className="card-logo"
              />
              <h4>Meta Ads Spend</h4>
            </div>
            {fbLoading ? (
              <CardLoader />
            ) : (
              <h2>₹{Number(fbSpend || 0).toFixed(2)}</h2>
            )}
          </div>

          <div className="card green">
            <div className="card-header">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Ads_logo.svg"
                alt="Google Ads"
                className="card-logo"
              />
              <h4>Google Ads Spend</h4>
            </div>
            {googleLoading ? (
              <CardLoader />
            ) : (
              <h2>₹{Number(googleSpend || 0).toFixed(2)}</h2>
            )}
          </div>

          <div className="card purple">
            <div className="card-header">
              <img
                src="https://cdn-icons-png.flaticon.com/512/263/263142.png"
                alt="Orders"
                className="card-logo"
              />
              <h4>Total Orders</h4>
            </div>
            {ordersLoading ? <CardLoader /> : <h2>{totalOrders}</h2>}
          </div>

          <div className="card orange">
            <div className="card-header">
              <span className="rupee-icon">₹</span>
              <h4>Total Revenue</h4>
            </div>
            {ordersLoading ? (
              <CardLoader />
            ) : (
              <h2>₹{totalRevenue.toLocaleString("en-IN")}</h2>
            )}
          </div>
          <div className="card indigo">
            <div className="card-header">
              <span className="cpp-icon">📈</span>
              <h4>CPP</h4>
            </div>

            {ordersLoading ? <CardLoader /> : <h2>₹{cpo.toFixed(2)}</h2>}
          </div>
        </section>

        <section className="analytics">
          <div className="chart-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                marginLeft: "10px",
              }}
            >
              <h3 className="chart-title">
                {metric === "orders"
                  ? "Orders (Last 7 Days)"
                  : "Revenue (Last 7 Days)"}
              </h3>

              <div className="metric-dropdown">
                <button className="metric-btn" onClick={() => setOpen(!open)}>
                  {metric === "orders" ? "Total Orders" : "Total Revenue"}
                  <span className="chevron">⌄</span>
                </button>

                {open && (
                  <div className="metric-menu">
                    <div
                      className={`metric-item ${
                        metric === "orders" ? "active" : ""
                      }`}
                      onClick={() => {
                        setMetric("orders");
                        setOpen(false);
                      }}
                    >
                      Total Orders
                    </div>

                    <div
                      className={`metric-item ${
                        metric === "revenue" ? "active" : ""
                      }`}
                      onClick={() => {
                        setMetric("revenue");
                        setOpen(false);
                      }}
                    >
                      Total Revenue
                    </div>
                  </div>
                )}
              </div>
            </div>

            {chartLoading ? (
              <CardLoader />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={last7DaysData.map((d) => ({
                    date: d._id,
                    value: metric === "orders" ? d.count : d.totalRevenue,
                  }))}
                  barSize={32}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      metric === "orders"
                        ? [`${value} Orders`, ""]
                        : [`₹${Number(value).toLocaleString("en-IN")}`, ""]
                    }
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    }
                  />
                  <Bar
                    dataKey="value"
                    radius={[10, 10, 0, 0]}
                    fill={
                      metric === "orders"
                        ? "url(#colorOrders)"
                        : "url(#colorRevenue)"
                    }
                  />
                  <defs>
                    <linearGradient
                      id="colorOrders"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>

                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card2 premium">
            <div className="chart-header">
              <div>
                <h3>Ad Spend Comparison</h3>
                <p
                  className="muted"
                  style={{ fontWeight: 780, fontSize: "13px" }}
                >
                  Facebook vs Google · Last 7 Days
                </p>
              </div>

              <div className="legend">
                <span className="fb-dot"> Meta Ads</span>
                <span className="google-dot"> Google Ads</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={mergedAdSpend} barSize={26} barGap={8}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="date"
                  tick={{ fill: "#000000", fontSize: 12 }}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fill: "#000000", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px rgba(0,0,0,.12)",
                    padding: "10px 14px",
                  }}
                  formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
                />

                <defs>
                  <linearGradient id="metaPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>

                  <linearGradient
                    id="googlePremium"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#6ee7b7" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>

                <Bar
                  dataKey="facebook"
                  fill="url(#metaPremium)"
                  radius={[10, 10, 0, 0]}
                />
                <Bar
                  dataKey="google"
                  fill="url(#googlePremium)"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>

      <style>{`
       .modal-backdrop {
          position: fixed;
          top:0; left:0; right:0; bottom:0;
          background: rgba(0,0,0,0.5);
          display:flex;
          align-items:center;
          justify-content:center;
          z-index: 1000;
        }

        .modal {
          background:#fff;
          padding: 20px 30px;
          border-radius: 14px;
          max-width:400px;
          width:100%;
          box-shadow:0 10px 30px rgba(0,0,0,0.2);
        }

        .date-inputs {
          display:flex;
          flex-direction:column;
          gap:15px;
          margin: 15px 0;
        }

        .date-inputs label {
          display:flex;
          flex-direction:column;
          font-size: 14px;
        }

        .modal-actions {
          display:flex;
          justify-content:flex-end;
          gap:10px;
        }

        .modal-actions button {
          padding: 8px 14px;
          border-radius: 999px;
          border:none;
          cursor:pointer;
          background:#2563eb;
          color:#fff;
        }

        .modal-actions button:last-child {
          background:#e2e8f0;
          color:#000;
        }
        * { box-sizing: border-box; font-family: Inter, sans-serif; }
        body { margin: 0; }
        .app { display: flex; min-height: 100vh; background: #f4f6fa; }
        .sidebar { width: 240px; background: linear-gradient(180deg,#0f172a,#020617); color: #fff; padding: 20px; }
        .logo { margin-bottom: 30px; }
        nav a { display: block; padding: 12px 14px; border-radius: 10px; color: #cbd5f5; margin-bottom: 8px; cursor: pointer; }
        nav a.active, nav a:hover { background: #2563eb; color: #fff; }
        .main { flex: 1; padding: 28px; }
        .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .muted { color: #64748b; font-size: 13px; }
        .profile { display: flex; align-items: center; gap: 10px; background: #fff; padding: 8px 12px; border-radius: 14px; box-shadow: 0 10px 25px rgba(0,0,0,.08); }
        .profile img { border-radius: 50%; }
        .profile span { font-size: 12px; color: #64748b; }
        .filters { display: flex; gap: 10px; margin-bottom: 22px; }
        .filters button { padding: 8px 16px; border-radius: 999px; border: none; background: #e2e8f0; cursor: pointer; }
        .filters .active { background: #2563eb; color: #fff; }
        .cards { display: grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 20px; }
        .card { background: #fff; padding: 20px; border-radius: 18px; box-shadow: 0 20px 40px rgba(0,0,0,.06); }
        .card h2 { margin: 10px 0; }
        .blue { border-top: 4px solid #2563eb; }
        .green { border-top: 4px solid #16a34a; }
        .purple { border-top: 4px solid #7c3aed; }
        .orange { border-top: 4px solid #f97316; }
        .indigo { border-top: 4px solid #4f46e5; }
        .analytics { margin-top: 30px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; }
        .chart { background: #fff; padding: 20px; border-radius: 18px; box-shadow: 0 20px 40px rgba(0,0,0,.06); }
        .fake-chart { height: 220px; border-radius: 14px; background: linear-gradient(135deg,#e5e7eb,#f8fafc); display:flex; align-items:center; justify-content:center; color:#94a3b8; }
      `}</style>
    </div>
  );
}
