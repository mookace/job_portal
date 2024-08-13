const express = require("express");
const router = express.Router();

// FrontEnd Users Routes
const userRoutes = require("./api/frontUsers");
router.use("/user", userRoutes);

//Admin Users Routes
const adminRoutes = require("./api/adminUser");
router.use("/admin", adminRoutes);

module.exports = router;
