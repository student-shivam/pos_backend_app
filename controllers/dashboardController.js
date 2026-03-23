const Bills = require("../models/billsModel");

// Shared date helpers
const getStartOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

const getStartOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

// GET /api/dashboard/today-sales
const todaySalesController = async (req, res) => {
  try {
    const result = await Bills.aggregate([
      { $match: { date: { $gte: getStartOfToday(), $lte: getEndOfToday() } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);
    res.status(200).json({
      success: true,
      todayRevenue: result[0]?.total || 0,
      todayOrders: result[0]?.count || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching today sales" });
  }
};

// GET /api/dashboard/monthly-sales
const monthlySalesController = async (req, res) => {
  try {
    const result = await Bills.aggregate([
      { $match: { date: { $gte: getStartOfMonth() } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);
    res.status(200).json({
      success: true,
      monthlyRevenue: result[0]?.total || 0,
      monthlyOrders: result[0]?.count || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching monthly sales" });
  }
};

// GET /api/dashboard/total-orders
const totalOrdersController = async (req, res) => {
  try {
    const total = await Bills.countDocuments();
    const totalRevenue = await Bills.aggregate([
      { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
    ]);
    res.status(200).json({
      success: true,
      totalOrders: total,
      totalRevenue: totalRevenue[0]?.sum || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching total orders" });
  }
};

// GET /api/dashboard/top-products
const topProductsController = async (req, res) => {
  try {
    const bills = await Bills.find({}, { cartItems: 1 });
    const productMap = {};
    bills.forEach((bill) => {
      bill.cartItems.forEach((item) => {
        const key = item.name;
        if (!productMap[key]) {
          productMap[key] = { name: key, quantity: 0, revenue: 0 };
        }
        productMap[key].quantity += item.quantity || 1;
        productMap[key].revenue += (item.quantity || 1) * (item.price || 0);
      });
    });

    const sorted = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.status(200).json({ success: true, topProducts: sorted });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching top products" });
  }
};

// GET /api/dashboard/revenue?period=daily|monthly
// Returns last 7 days (daily) or last 6 months (monthly)
const revenueController = async (req, res) => {
  try {
    const period = req.query.period || "daily";

    if (period === "daily") {
      // Last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const start = new Date();
        start.setDate(start.getDate() - i);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        const result = await Bills.aggregate([
          { $match: { date: { $gte: start, $lte: end } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
        ]);
        days.push({
          label: start.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
          revenue: result[0]?.total || 0,
          orders: result[0]?.count || 0,
        });
      }
      return res.status(200).json({ success: true, data: days });
    }

    // Monthly - last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);

      const result = await Bills.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]);
      months.push({
        label: start.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
        revenue: result[0]?.total || 0,
        orders: result[0]?.count || 0,
      });
    }
    return res.status(200).json({ success: true, data: months });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching revenue data" });
  }
};

module.exports = {
  todaySalesController,
  monthlySalesController,
  totalOrdersController,
  topProductsController,
  revenueController,
};
