const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// All user management routes require admin privileges
router.use(authenticate);
router.use(authorize("user:read"));

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);

// Only admins can update or deactivate users
router.patch("/:id", authorize("user:update"), userController.updateUser);
router.delete("/:id", authorize("user:delete"), userController.deactivateUser);

module.exports = router;
