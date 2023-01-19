const express = require("express");
const testUser = require("../middleware/testUser");
const router = express.Router();

const {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobs");

// chaining shorthand fpr method and routes
router.route("/").post(testUser, createJob).get(getAllJobs);
router.route("/:id").get(getJob).delete(testUser, deleteJob).patch(testUser, updateJob);

module.exports = router;
