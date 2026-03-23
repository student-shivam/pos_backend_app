const Customer = require("../models/customerModel");
const Bills = require("../models/billsModel");

// GET all customers
const getAllCustomersController = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    // Enrich each customer with order stats from bills
    const enriched = await Promise.all(
      customers.map(async (customer) => {
        const bills = await Bills.find({ customerNumber: customer.phone });
        const totalOrders = bills.length;
        const totalPurchase = bills.reduce((sum, b) => sum + b.totalAmount, 0);
        return {
          ...customer.toObject(),
          totalOrders,
          totalPurchase,
        };
      })
    );

    res.status(200).json({ success: true, customers: enriched });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error fetching customers" });
  }
};

// GET single customer
const getCustomerByIdController = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    // Get order history
    const orders = await Bills.find({ customerNumber: customer.phone }).sort({ date: -1 });
    const totalOrders = orders.length;
    const totalPurchase = orders.reduce((sum, b) => sum + b.totalAmount, 0);

    res.status(200).json({
      success: true,
      customer: { ...customer.toObject(), totalOrders, totalPurchase },
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error fetching customer" });
  }
};

// POST add customer
const addCustomerController = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Name and Phone are required" });
    }
    const existing = await Customer.findOne({ phone });
    if (existing) {
      return res.status(400).json({ success: false, message: "Customer with this phone already exists" });
    }
    const customer = new Customer({ name, phone, email, address });
    await customer.save();
    res.status(201).json({ success: true, message: "Customer added successfully", customer });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error adding customer" });
  }
};

// PUT update customer
const updateCustomerController = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, email, address },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, message: "Customer updated", customer });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error updating customer" });
  }
};

// DELETE customer
const deleteCustomerController = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error deleting customer" });
  }
};

module.exports = {
  getAllCustomersController,
  getCustomerByIdController,
  addCustomerController,
  updateCustomerController,
  deleteCustomerController,
};
