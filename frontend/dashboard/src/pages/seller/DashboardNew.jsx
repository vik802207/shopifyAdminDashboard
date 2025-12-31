import { useState } from "react";
import "./DashboardNew.css";

export default function DashboardNew({ orders = [] }) {
  const [activeMenu, setActiveMenu] = useState("Orders");
    console.log("DASHBOARD ORDERS 👉", orders); // 🔥 ADD THIS

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
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="logo">ProMark.</h2>
        <nav>
          {menuItems.map((item) => (
            <a
              key={item}
              className={activeMenu === item ? "active" : ""}
              onClick={() => setActiveMenu(item)}
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="content">
        <h1>{activeMenu}</h1>

        {activeMenu === "Orders" && (
          <div className="orders-layout single">
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Tax</th>
                    <th>Source</th>
                    <th>UTM Source</th>
                    <th>UTM Medium</th>
                    <th>UTM Campaign</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center" }}>
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id}>
                        <td>{order.orderNumber}</td>
                        <td>
                          {new Date(order.OrderDate).toLocaleString()}
                        </td>
                        <td>₹{order.totalPrice}</td>
                        <td>₹{order.totalTax}</td>
                        <td>{order.sourceName}</td>
                        <td>{order.utmSource || "-"}</td>
                        <td>{order.utmMedium || "-"}</td>
                        <td>{order.utmCampaign || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
