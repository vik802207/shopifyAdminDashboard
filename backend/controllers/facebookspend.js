const FacebookSpend = require("../models/FacebookSpend")
const User = require("../models/User");

    const getFacebookSpend = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const seller = await User.findById(sellerId).lean();
    if (!seller || !seller.facebookAdAccountId) {
      return res.status(400).json({ message: "Facebook account not connected" });
    }

    const { range, startDate, endDate } = req.query;
    const filter = { adAccountId: seller.facebookAdAccountId };
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

    // ✅ ARRAY milega
    const spends = await FacebookSpend.find(filter).lean();

    const totalSpend = spends.reduce(
      (sum, s) => sum + Number(s.spend || 0),
      0
    );

    res.json({
      totalSpend,
      count: spends.length
    });

  } catch (err) {
    console.error("Facebook spend error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
  const getLast7DaysFacebookSpend = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const seller = await User.findById(sellerId).lean();
    if (!seller || !seller.facebookAdAccountId) {
      return res.status(400).json({ message: "Facebook account not connected" });
    }

    const adAccountId = seller.facebookAdAccountId;

    // 🔥 IST handling
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;

    // 🔹 Today IST end (23:59:59)
    const end = new Date(Date.now() + IST_OFFSET);
    end.setUTCHours(23, 59, 59, 999);

    // 🔹 7 days ago IST start (00:00:00)
    const start = new Date(end);
    start.setUTCDate(end.getUTCDate() - 6);
    start.setUTCHours(0, 0, 0, 0);

    const spends = await FacebookSpend.aggregate([
      {
        $match: {
          adAccountId,
          spendDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$spendDate",
              timezone: "+05:30" // 🔥 IMPORTANT
            }
          },
          totalSpend: { $sum: "$spend" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(spends);
  } catch (err) {
    console.error("❌ last7days facebook spend error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  getFacebookSpend,
  getLast7DaysFacebookSpend
};
