const mongoose = require("mongoose");

const settingsSchema = mongoose.Schema(
  {
    // Store Information
    storeName: { type: String, default: "RAVINDRA FOOD" },
    storeAddress: { type: String, default: "" },
    storePhone: { type: String, default: "" },
    storeEmail: { type: String, default: "" },
    storeLogo: { type: String, default: "" }, // base64 or URL

    // Tax Settings
    taxEnabled: { type: Boolean, default: false },
    taxPercentage: { type: Number, default: 0 },
    taxLabel: { type: String, default: "GST" },

    // Low Stock Threshold
    lowStockThreshold: { type: Number, default: 10 },
  },
  { timestamps: true }
);

const Settings = mongoose.model("settings", settingsSchema);
module.exports = Settings;
