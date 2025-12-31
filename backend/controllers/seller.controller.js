const User = require("../models/User");
const Order = require("../models/Order");

const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { filter, from, to } = req.query;

    const seller = await User.findById(sellerId).lean();
    if (!seller || !seller.shopDomain) {
      return res.status(400).json({ message: "Store domain not found" });
    }

    const storeDomain = seller.shopDomain;

    let startDate, endDate;

    if (filter === "today") {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } 
    else if (filter === "yesterday") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
    } 
    else if (filter === "custom") {
      if (!from || !to) {
        return res.status(400).json({ message: "From and To date required" });
      }

      const start = new Date(from);
      start.setHours(0, 0, 0, 0);

      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      startDate = start;
      endDate = end;
    } 
    else {
      return res.status(400).json({ message: "Invalid filter" });
    }

    // ✅ FETCH EVERYTHING (NO FIELD DROPPED)
    const orders = await Order.find({
      storeDomain,
      OrderDate: { $gte: startDate, $lte: endDate }
    })
      .sort({ OrderDate: -1 })
      .lean(); // faster + clean JSON
    // console.log(orders);
    return res.status(200).json({
      storeDomain,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error("❌ getSellerOrders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
const getLast7DaysOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const seller = await User.findById(sellerId).lean();
    if (!seller || !seller.shopDomain) {
      return res.status(400).json({ message: "Store domain not found" });
    }

    const storeDomain = seller.shopDomain;

    // 🔥 IST offset (5.5 hours)
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;

    // 🔹 Today IST 23:59:59
    const end = new Date(Date.now() + IST_OFFSET);
    end.setUTCHours(23, 59, 59, 999);

    // 🔹 7 days ago IST 00:00:00
    const start = new Date(end);
    start.setUTCDate(end.getUTCDate() - 6);
    start.setUTCHours(0, 0, 0, 0);

    const orders = await Order.aggregate([
      {
        $match: {
          storeDomain,
          OrderDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$OrderDate",
              timezone: "+05:30"   // 🔥 VERY IMPORTANT
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(orders);
  } catch (error) {
    console.error("❌ getLast7DaysOrders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getLast7DaysOrdersRevenue = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const seller = await User.findById(sellerId).lean();
    if (!seller || !seller.shopDomain) {
      return res.status(400).json({ message: "Store domain not found" });
    }

    const storeDomain = seller.shopDomain;

    // 🔥 IST offset (5.5 hours)
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;

    // 🔹 Today IST 23:59:59
    const end = new Date(Date.now() + IST_OFFSET);
    end.setUTCHours(23, 59, 59, 999);

    // 🔹 7 days ago IST 00:00:00
    const start = new Date(end);
    start.setUTCDate(end.getUTCDate() - 6);
    start.setUTCHours(0, 0, 0, 0);

    const data = await Order.aggregate([
      {
        $match: {
          storeDomain,
          OrderDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$OrderDate",
              timezone: "+05:30" // ✅ IST grouping
            }
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(data);
  } catch (error) {
    console.error("❌ getLast7DaysOrdersRevenue error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = { getSellerOrders,getLast7DaysOrders,getLast7DaysOrdersRevenue };
