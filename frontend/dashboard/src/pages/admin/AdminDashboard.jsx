/* eslint-disable no-unused-vars */
import { useState } from "react";
import api from "../../api/axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopDomain, setShopDomain] = useState("");
  const [shopifyToken, setShopifyToken] = useState("");
  const [fbAdAccount, setFbAdAccount] = useState("");
  const [googleCustomerId, setGoogleCustomerId] = useState("");

  const addSeller = async (e) => {
    e.preventDefault();

    try {
      await api.post("/admin/create-seller", {
        name,
        email,
        password,
        shopDomain,
        shopifyAccessToken: shopifyToken,
        facebookAdAccountId: fbAdAccount,
        googleCustomerId,
      });

      alert("Seller created successfully");
      setName("");
      setEmail("");
      setPassword("");
      setShowModal(false);
    } catch (err) {
      alert("Failed to create seller");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {/* BUTTON ROW */}
      <div className="btn-row">
        <button className="primary-btn" onClick={() => setShowModal(true)}>
          + Add Seller
        </button>

        <a
          href="https://thepromark.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="secondary-btn link-btn"
        >
          Show Dashboard
        </a>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Seller</h2>

            <form onSubmit={addSeller}>
              <input
                placeholder="Seller Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                placeholder="Seller Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                placeholder="Temporary Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                placeholder="Shop Domain (example.myshopify.com)"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
              />

              <input
                placeholder="Shopify Access Token"
                value={shopifyToken}
                onChange={(e) => setShopifyToken(e.target.value)}
              />

              <input
                placeholder="Facebook Ad Account ID"
                value={fbAdAccount}
                onChange={(e) => setFbAdAccount(e.target.value)}
              />

              <input
                placeholder="Google Ads Customer ID"
                value={googleCustomerId}
                onChange={(e) => setGoogleCustomerId(e.target.value)}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Create Seller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
