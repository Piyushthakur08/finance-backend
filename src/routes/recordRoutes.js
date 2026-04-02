const express = require("express");
const router = express.Router();
const recordController = require("../controllers/recordController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { validateRecordInput } = require("../validators/inputValidators");

router.use(authenticate);

// Analysts and admins can view records
router.get("/", authorize("record:read"), recordController.getRecords);
router.get("/:id", authorize("record:read"), recordController.getRecordById);

// Only admins can create, update, delete records
router.post("/", authorize("record:create"), validateRecordInput, recordController.createRecord);
router.patch("/:id", authorize("record:update"), recordController.updateRecord);
router.delete("/:id", authorize("record:delete"), recordController.deleteRecord);

module.exports = router;
