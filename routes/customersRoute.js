const express = require("express");
const {
  getAllCustomersController,
  getCustomerByIdController,
  addCustomerController,
  updateCustomerController,
  deleteCustomerController,
} = require("../controllers/customersController");

const router = express.Router();

router.get("/", getAllCustomersController);
router.get("/:id", getCustomerByIdController);
router.post("/", addCustomerController);
router.put("/:id", updateCustomerController);
router.delete("/:id", deleteCustomerController);

module.exports = router;
