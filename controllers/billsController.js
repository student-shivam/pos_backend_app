const billsModel = require("../models/billsModel");

//add items
const addBillsController = async (req, res) => {
  try {
    const newBill = new billsModel(req.body);
    await newBill.save();
    
    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      console.log("Emitting new-order event for bill:", newBill._id);
      io.emit("new-order", newBill);
    } else {
      console.error("Socket.io instance not found on app");
    }
    
    res.status(201).json({ success: true, message: "Bill Created Successfully!", bill: newBill });
  } catch (error) {
    res.send("something went wrong");
    console.log(error);
  }
};
const totalRevenueController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // 🔹 1️⃣ Total Revenue (All time)
    const revenueResult = await billsModel.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const totalOrders = await billsModel.countDocuments();

    // 🔹 2️⃣ Today's Stats
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayStats = await billsModel.aggregate([
      {
        $match: {
          date: { $gte: startOfToday, $lte: endOfToday }
        }
      },
      {
        $group: {
          _id: null,
          todayRevenue: { $sum: "$totalAmount" },
          todayOrders: { $sum: 1 }
        }
      }
    ]);

    const todayRevenue = todayStats[0]?.todayRevenue || 0;
    const todayOrders = todayStats[0]?.todayOrders || 0;

    // 🔹 3️⃣ Monthly Stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyStats = await billsModel.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          monthlyRevenue: { $sum: "$totalAmount" },
          monthlyOrders: { $sum: 1 }
        }
      }
    ]);

    const monthlyRevenue = monthlyStats[0]?.monthlyRevenue || 0;
    const monthlyOrders = monthlyStats[0]?.monthlyOrders || 0;

    res.status(200).json({
      success: true,
      totalRevenue,
      totalOrders,
      todayRevenue,
      todayOrders,
      monthlyRevenue,
      monthlyOrders
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};



//get blls data
const getBillsController = async (req, res) => {
  try {
    const bills = await billsModel.find();
    res.send(bills);
  } catch (error) {
    console.log(error);
  }
};

const deleteBillsController = async (req, res) => {
  try {
    const result = await billsModel.deleteMany({});

    res.status(200).json({
      success: true,
      message: "All bills deleted successfully",
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error deleting bills"
    });
  }
};

const getUserBillsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const bills = await billsModel.find({ userId }).sort({ date: -1 });
    res.status(200).json({
      success: true,
      bills,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching user bills",
    });
  }
};

// update bill status
const updateBillStatusController = async (req, res) => {
  try {
    const { status } = req.body;
    const bill = await billsModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (bill) {
      const io = req.app.get("io");
      if (io) {
        // Emit to specific user's room
        io.to(bill.userId).emit("order-status-update", {
          orderId: bill._id,
          status: bill.status,
          customerName: bill.customerName
        });
        console.log(`Emitted status update for user ${bill.userId}: ${bill.status}`);
      }
    }

    res.status(200).json({
      success: true,
      message: "Order Status Updated",
      bill,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error updating status",
    });
  }
};

// get single bill
const getBillByIdController = async (req, res) => {
  try {
    const bill = await billsModel.findById(req.params.id);
    res.status(200).json({
      success: true,
      bill,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching bill details",
    });
  }
};

module.exports = {
  addBillsController,
  getBillsController,
  deleteBillsController,
  totalRevenueController,
  getUserBillsController,
  updateBillStatusController,
  getBillByIdController
};
