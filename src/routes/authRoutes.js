const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");
const { validateUserInput, validateLoginInput } = require("../validators/inputValidators");

router.post("/register", validateUserInput, authController.register);
router.post("/login", validateLoginInput, authController.login);
router.get("/profile", authenticate, authController.getProfile);

module.exports = router;
