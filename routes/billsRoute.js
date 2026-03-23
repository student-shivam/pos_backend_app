const express = require("express");
const {
  addBillsController,
  getBillsController,
  deleteBillsController,
  totalRevenueController,
  getUserBillsController,
  updateBillStatusController,
  getBillByIdController,
} = require("./../controllers/billsController");

const router = express.Router();

//routes
router.post("/add-bills", addBillsController);
//MEthod - POST
router.get("/total-revenue", totalRevenueController);

//MEthod - GET
router.get("/get-bills", getBillsController);


router.delete("/delete-bills",deleteBillsController);

router.get("/get-user-bills/:userId", getUserBillsController);

// Update status
router.put("/update-status/:id", updateBillStatusController);

// Get single bill
router.get("/get-bill/:id", getBillByIdController);

module.exports = router;
