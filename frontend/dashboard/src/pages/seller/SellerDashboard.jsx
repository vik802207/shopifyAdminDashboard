/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../../api/axios";
import Dashboard from "./Dashboard";
import "./SellerDashboard.css";
import ErrorBoundary from "./ErrorBoundary";
const SellerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("today");
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // pagination states
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ================= SORT HANDLER =================
  const handleSort = (key) => {
    setPage(1); // 👈 add this
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // ================= SORTED DATA =================
  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    if (sortConfig.key === "OrderDate") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (typeof aVal === "number") {
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return sortConfig.direction === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  // ================= FETCH ALL ORDERS =================
  const fetchOrders = async (type) => {
    try {
      setLoading(true);

      let url = `/seller/orders?filter=${type}`;

      if (type === "custom") {
        url += `&from=${fromDate}&to=${toDate}`;
      }

      const res = await api.get(url);
      setOrders(res.data.orders || []);
    } catch (err) {
      alert("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === "Orders") {
      fetchOrders(filter);
    }
  }, [filter, activeMenu]);

  // ================= FRONTEND PAGINATION LOGIC =================
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / rowsPerPage));

  const menuItems = [
    "Dashboard",
    "Orders",
    "Payments",
    "Customers",
    "Reports",
    "Settings",
  ];

  return (
    <div className="app">
      {/* ================= SIDEBAR ================= */}
     <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
  <h2 className="logo">ProMark.</h2>

  <nav>
    {menuItems.map((item) => (
      <a
        key={item}
        className={activeMenu === item ? "active" : ""}
        onClick={() => {
          setActiveMenu(item);
          setSidebarOpen(false); // 👈 yahi line add hui
          if (item === "Orders") setPage(1);
        }}
      >
        {item}
      </a>
    ))}
  </nav>
</aside>


      {/* ================= MAIN ================= */}
      <main className="content">
      <div className="mobile-topbar">
  <button
    className="hamburger"
    onClick={() => setSidebarOpen(!sidebarOpen)}
  >
    ☰
  </button>
</div>

        {/* ===== FILTERS (ONLY FOR ORDERS) ===== */}
        {activeMenu === "Orders" && (
          <div className="filter-bar">
            <button
              className={
                filter === "today" ? "filter-btn active" : "filter-btn"
              }
              onClick={() => {
                setFilter("today");
                setPage(1);
              }}
            >
              Today
            </button>

            <button
              className={
                filter === "yesterday" ? "filter-btn active" : "filter-btn"
              }
              onClick={() => {
                setFilter("yesterday");
                setPage(1);
              }}
            >
              Yesterday
            </button>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />

            <button
              className={
                filter === "custom" ? "filter-btn active" : "filter-btn"
              }
              onClick={() => {
                if (!fromDate || !toDate) {
                  alert("Select From & To date");
                  return;
                }
                setFilter("custom");
                setPage(1);
              }}
            >
              Apply
            </button>

            <span className="total-count">
              <b>Total Orders:</b> {orders.length}
            </span>
          </div>
        )}

        {/* ================= ORDERS TABLE ================= */}
        {activeMenu === "Orders" && (
          <>
            {loading ? (
              <div className="loader-wrap">
                <div className="loader"></div>
                <p>Loading orders...</p>
              </div>
            ) : (
              <div className="orders-layout single">
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th onClick={() => handleSort("orderNumber")}>
                          Order #
                        </th>
                        <th onClick={() => handleSort("OrderDate")}>
                          Order Date
                        </th>

                        <th onClick={() => handleSort("totalPrice")}>Total</th>
                        <th onClick={() => handleSort("totalTax")}>Tax</th>
                        <th onClick={() => handleSort("totalDiscounts")}>
                          Discount
                        </th>
                        <th>Currency</th>

                        <th>Financial Status</th>
                        <th>Payment Gateway</th>
                        <th>Transaction Status</th>
                        <th>Transaction Kind</th>
                        <th>Transaction Amount</th>

                        <th>Fulfillment Status</th>
                        <th>Fulfillment Service</th>
                        <th>Tracking Company</th>
                        <th>Tracking Number</th>

                        <th>Shipping City</th>
                        <th>Shipping State</th>
                        <th>Shipping Country</th>

                        <th>Billing City</th>
                        <th>Billing State</th>
                        <th>Billing Country</th>

                        <th>Channel</th>
                        <th>Source</th>
                        <th>UTM Source</th>
                        <th>UTM Medium</th>
                        <th>UTM Campaign</th>

                        <th>Landing Page</th>
                        <th>Referrer URL</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedOrders.length === 0 ? (
                        <tr>
                          <td colSpan="28" align="center">
                            No orders found
                          </td>
                        </tr>
                      ) : (
                        paginatedOrders.map((order) => (
                          <tr key={order._id}>
                            <td>{order.orderNumber}</td>
                            <td>
                              {new Date(order.OrderDate).toLocaleString()}
                            </td>

                            <td>₹{order.totalPrice}</td>
                            <td>₹{order.totalTax}</td>
                            <td>₹{order.totalDiscounts}</td>
                            <td>{order.currency}</td>

                            <td>{order.displayFinancialStatus}</td>
                            <td>{order.paymentGateway}</td>
                            <td>{order.transactionStatus}</td>
                            <td>{order.transactionKind}</td>
                            <td>₹{order.transactionAmount}</td>

                            <td>{order.displayFulfillmentStatus}</td>
                            <td>{order.fulfillmentService || "-"}</td>
                            <td>{order.fulfillmentTrackingCompany || "-"}</td>
                            <td>{order.fulfillmentTrackingNumber || "-"}</td>

                            <td>{order.shippingCity}</td>
                            <td>{order.shippingState}</td>
                            <td>{order.shippingCountry}</td>

                            <td>{order.billingCity}</td>
                            <td>{order.billingState}</td>
                            <td>{order.billingCountry}</td>

                            <td>{order.channel}</td>
                            <td>{order.sourceName}</td>
                            <td>{order.utmSource || "-"}</td>
                            <td>{order.utmMedium || "-"}</td>
                            <td>{order.utmCampaign || "-"}</td>

                            <td className="ellipsis">{order.landingPage}</td>
                            <td className="ellipsis">{order.referrerUrl}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ================= PAGINATION BAR ================= */}
                <div className="pagination-bar">
                  <div>
                    Rows per page:&nbsp;
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setPage(1);
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <span>
                    {sortedOrders.length === 0
                      ? "0–0 of 0"
                      : `${startIndex + 1}–${Math.min(
                          endIndex,
                          sortedOrders.length
                        )} of ${sortedOrders.length}`}
                  </span>

                  <div className="pagination-buttons">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      ←
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ================= OTHER PAGES ================= */}
        {activeMenu === "Dashboard" && (
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        )}
        {activeMenu !== "Orders" && activeMenu !== "Dashboard" && (
          <div className="empty-page">
            <h3>{activeMenu}</h3>
            <p>Content will be added here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerDashboard;
