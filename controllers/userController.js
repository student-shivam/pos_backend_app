const userModal = require("../models/userModel");
const jwt = require("jsonwebtoken");

// login user
const loginController = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await userModal.findOne({ userId });
    
    if (user && (await user.comparePassword(password))) {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "secret_key",
        { expiresIn: "1d" }
      );

      res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          userId: user.userId,
          role: user.role,
          email: user.email,
          phone: user.phone,
          image: user.image
        },
        token,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid User ID or Password",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error in Login API" });
  }
};

//register
const registerController = async (req, res) => {
  try {
    const { userId } = req.body;
    // Check if user already exists
    const existingUser = await userModal.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User ID already exists" });
    }

    const newUser = new userModal({ ...req.body, verified: true });
    await newUser.save();
    res.status(201).json({ success: true, message: "User Registered Successfully!" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: "Error in Registration API" });
  }
};

// update profile
const updateProfileController = async (req, res) => {
  try {
    const { id, userId, name, email, phone, image } = req.body;
    
    // Attempt to find by ID, or fallback to userId if ID is missing/invalid
    let user;
    if (id && id.match(/^[0-4a-fA-F]{24}$/)) {
      user = await userModal.findById(id);
    }
    
    if (!user && userId) {
      user = await userModal.findOne({ userId });
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found with the provided ID or User ID" 
      });
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    if (image) user.image = image;

    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      user: {
        _id: user._id,
        name: user.name,
        userId: user.userId,
        role: user.role,
        email: user.email,
        phone: user.phone,
        image: user.image
      }
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Error in Update Profile API", error: error.message });
  }
};

// update password
const updatePasswordController = async (req, res) => {
  try {
    const { id, oldPassword, newPassword } = req.body;
    const user = await userModal.findById(id);
    
    if (user && (await user.comparePassword(oldPassword))) {
      user.password = newPassword; // The pre-save hook will hash it
      await user.save();
      res.status(200).json({ success: true, message: "Password Updated Successfully" });
    } else {
      res.status(401).json({ success: false, message: "Invalid Old Password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error in Update Password API" });
  }
};

module.exports = {
  loginController,
  registerController,
  updateProfileController,
  updatePasswordController
};
