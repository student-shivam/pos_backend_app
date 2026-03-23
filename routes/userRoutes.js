const express = require("express");
const {
  loginController,
  registerController,
  updateProfileController,
  updatePasswordController,
} = require("./../controllers/userController");

const router = express.Router();

//Method - POST
router.post("/login", loginController);

//Method - POST
router.post("/register", registerController);

//Method - POST
router.post("/update-profile", updateProfileController);

//Method - POST
router.post("/update-password", updatePasswordController);

module.exports = router;
