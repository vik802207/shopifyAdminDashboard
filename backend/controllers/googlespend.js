const { ConnectionStates } = require("mongoose");
const GoogleAdsSpend=require("../models/GoogleAdSpend");
const User = require("../models/User");

  const getGoogleSpend = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // 🔍 Seller fetch
    const seller = await User.findById(sellerId).lean();
    if (!seller || !seller.googleCustomerId) {
      return res.status(400).json({ message: "Google Ads account not connected" });
    }
    
    const { range, startDate, endDate } = req.query;

    const filter = {
      customerId: seller.googleCustomerId
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (range === "today") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      filter.spendDate = { $gte: today, $lt: tomorrow };
    } 
    else if (range === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      filter.spendDate = { $gte: yesterday, $lt: today };
    } 
    else if (range === "custom") {
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and End dates required" });
      }

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filter.spendDate = { $gte: start, $lte: end };
    } 
    else {
      return res.status(400).json({ message: "Invalid range" });
    }

    // ✅ ARRAY result
    const spends = await GoogleAdsSpend.find(filter).lean();

    const totalSpend = spends.reduce(
      (sum, s) => sum + Number(s.spend || 0),
      0
    );

    res.json({
      totalSpend,
      count: spends.length
    });

  } catch (err) {
    console.error("Google spend error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
  const getLast7DaysGoogleSpend = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const seller = await User.findById(sellerId).lean();
    if (!seller || !seller.googleCustomerId) {
      return res
        .status(400)
        .json({ message: "Google Ads account not connected" });
    }

    const customerId = seller.googleCustomerId;

    // 🔥 IST offset
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;

    // 🔹 Today IST end
    const end = new Date(Date.now() + IST_OFFSET);
    end.setUTCHours(23, 59, 59, 999);

    // 🔹 7 days ago IST start
    const start = new Date(end);
    start.setUTCDate(end.getUTCDate() - 6);
    start.setUTCHours(0, 0, 0, 0);

    const spends = await GoogleAdsSpend.aggregate([
      {
        $match: {
          customerId,
          spendDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$spendDate",
              timezone: "+05:30",
            },
          },
          totalSpend: { $sum: "$spend" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(spends);
  } catch (err) {
    console.error("❌ last7days google spend error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getGoogleSpend,
  getLast7DaysGoogleSpend
};
