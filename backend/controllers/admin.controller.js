const User = require("../models/User");
const bcrypt = require("bcryptjs");

const createSeller = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      shopDomain,
      shopifyAccessToken,
      facebookAdAccountId,
      googleCustomerId
    } = req.body;
    

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Seller already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "seller",

      // 🔽 save configs
      shopDomain,
      shopifyAccessToken,
      facebookAdAccountId,
      googleCustomerId
    });

    res.status(201).json({
      message: "Seller created successfully",
      sellerId: seller._id
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to create seller" });
  }
};


const createAdminSecret = async (req, res) => {
  try {
    const { name, email, password, secret } = req.body;

    if (secret !== process.env.ADMIN_CREATE_SECRET) {
      return res.status(403).json({ message: "Invalid secret key" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin"
    });

    res.status(201).json({
      message: "Admin created successfully",
      adminId: admin._id
    });

  } catch (err) {
    res.status(500).json({ message: "Admin creation failed" });
  }
};

module.exports = {
  createSeller,
  createAdminSecret
};
