const express = require("express");
const {
  todaySalesController,
  monthlySalesController,
  totalOrdersController,
  topProductsController,
  revenueController,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/today-sales", todaySalesController);
router.get("/monthly-sales", monthlySalesController);
router.get("/total-orders", totalOrdersController);
router.get("/top-products", topProductsController);
router.get("/revenue", revenueController);

module.exports = router;
