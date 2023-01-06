const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");
const { login, register, updateUser } = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.patch("/updateUser", authenticateUser, updateUser);

module.exports = router;
