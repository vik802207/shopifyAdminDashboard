const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const {
  createSeller,
  createAdminSecret
} = require("../controllers/admin.controller");

// 🔐 SECRET ADMIN CREATE (USE ONCE / RARELY)
router.post("/create-admin-secret", createAdminSecret);

// NORMAL ADMIN APIs
router.post("/create-seller", auth, role("admin"), createSeller);

module.exports = router;
