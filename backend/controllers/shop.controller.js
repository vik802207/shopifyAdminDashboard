const User = require("../models/User");
const axios = require("axios");

const getSellerShopDetails = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const seller = await User.findById(sellerId).lean();
    if (!seller || !seller.shopDomain || !seller.shopifyAccessToken) {
      return res.status(400).json({ message: "Shop not connected" });
    }

    const { shopDomain, shopifyAccessToken } = seller;
    // console.log("🔗 Fetching shop details for:", shopDomain,shopifyAccessToken);

    const response = await axios.get(
      `https://${shopDomain}/admin/api/2024-01/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
        },
      }
    );
    // console.log(response.data);

    const shop = response.data.shop;

    return res.status(200).json( shop);

  } catch (error) {
    console.error("❌ getSellerShopDetails error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch shop details" });
  }
};

module.exports = { getSellerShopDetails };
