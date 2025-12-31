const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const { getSellerOrders,getLast7DaysOrders } = require("../controllers/seller.controller");
const { getSellerShopDetails } = require("../controllers/shop.controller");
const {getFacebookSpend,getLast7DaysFacebookSpend} = require("../controllers/facebookspend");
const { getGoogleSpend } = require("../controllers/googlespend");
const {getLast7DaysOrdersRevenue}=require("../controllers/seller.controller")
const {getLast7DaysGoogleSpend}=require("../controllers/googlespend")

router.get("/orders", auth, role("seller"), getSellerOrders);
router.get("/shop-details", auth, getSellerShopDetails);
router.get("/facebook-spend", auth, getFacebookSpend);
router.get("/google-spend", auth, getGoogleSpend);
router.get("/last7days-orders", auth, getLast7DaysOrders);
router.get("/last7days-orders-revenue",auth,getLast7DaysOrdersRevenue);
router.get("/last7days-facebookspend",auth,getLast7DaysFacebookSpend)
router.get("/last7days-googlespend",auth,getLast7DaysGoogleSpend)

module.exports = router;
