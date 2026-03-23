const Settings = require("../models/settingsModel");
const Users = require("../models/userModel");
const Items = require("../models/itemModel");

// --------------- Admin Profile ---------------

// GET /api/admin/profile
const getAdminProfile = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await Users.findById(userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};

// PUT /api/admin/profile
const updateAdminProfile = async (req, res) => {
  try {
    const { id, name, email, phone, image } = req.body;
    const user = await Users.findByIdAndUpdate(
      id,
      { name, email, phone, image },
      { new: true }
    ).select("-password");
    res.status(200).json({ success: true, message: "Profile Updated Successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
};

// PUT /api/admin/change-password
const changeAdminPassword = async (req, res) => {
  try {
    const { id, oldPassword, newPassword } = req.body;
    const user = await Users.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: "Incorrect current password" });
    user.password = newPassword; // pre-save hook hashes it
    await user.save();
    res.status(200).json({ success: true, message: "Password Changed Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error changing password" });
  }
};

// --------------- Store Settings ---------------
const getOrInitSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await new Settings({}).save();
  }
  return settings;
};

// GET /api/settings/store
const getStoreSettings = async (req, res) => {
  try {
    const settings = await getOrInitSettings();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching store settings" });
  }
};

// PUT /api/settings/store
const updateStoreSettings = async (req, res) => {
  try {
    const { storeName, storeAddress, storePhone, storeEmail, storeLogo } = req.body;
    const settings = await getOrInitSettings();
    Object.assign(settings, { storeName, storeAddress, storePhone, storeEmail, storeLogo });
    await settings.save();
    res.status(200).json({ success: true, message: "Store settings saved", settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error saving store settings" });
  }
};

// --------------- Tax Settings ---------------

// GET /api/settings/tax
const getTaxSettings = async (req, res) => {
  try {
    const settings = await getOrInitSettings();
    res.status(200).json({
      success: true,
      taxEnabled: settings.taxEnabled,
      taxPercentage: settings.taxPercentage,
      taxLabel: settings.taxLabel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching tax settings" });
  }
};

// PUT /api/settings/tax
const updateTaxSettings = async (req, res) => {
  try {
    const { taxEnabled, taxPercentage, taxLabel } = req.body;
    const settings = await getOrInitSettings();
    settings.taxEnabled = taxEnabled;
    settings.taxPercentage = taxPercentage;
    if (taxLabel) settings.taxLabel = taxLabel;
    await settings.save();
    res.status(200).json({ success: true, message: "Tax settings saved", settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error saving tax settings" });
  }
};

// --------------- Low Stock ---------------

// GET /api/dashboard/low-stock
const getLowStockItems = async (req, res) => {
  try {
    const settings = await getOrInitSettings();
    const threshold = settings.lowStockThreshold || 10;
    const items = await Items.find({ quantity: { $lt: threshold } }).sort({ quantity: 1 });
    res.status(200).json({ success: true, items, threshold });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching low stock items" });
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getStoreSettings,
  updateStoreSettings,
  getTaxSettings,
  updateTaxSettings,
  getLowStockItems,
};
