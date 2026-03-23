const express = require("express");
const {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getStoreSettings,
  updateStoreSettings,
  getTaxSettings,
  updateTaxSettings,
  getLowStockItems,
} = require("../controllers/settingsController");

const router = express.Router();

// Admin Profile
router.get("/admin/profile", getAdminProfile);
router.put("/admin/profile", updateAdminProfile);
router.put("/admin/change-password", changeAdminPassword);

// Store Settings
router.get("/settings/store", getStoreSettings);
router.put("/settings/store", updateStoreSettings);

// Tax Settings
router.get("/settings/tax", getTaxSettings);
router.put("/settings/tax", updateTaxSettings);

// Low Stock
router.get("/dashboard/low-stock", getLowStockItems);

module.exports = router;
