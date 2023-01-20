const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const mongoose = require("mongoose");
const moment = require("moment");

// get all jobs
const getAllJobs = async (req, res) => {
  const { search, status, jobType, sort } = req.query;

  const queryObject = {
    createdBy: req.user.userId,
  };
  // basic text search
  if (search) {
    queryObject.position = { $regex: search, $options: "i" };
  }
  // additional criteria
  if (status && status !== "all") {
    queryObject.status = status;
  }

  if (jobType && jobType !== "all") {
    queryObject.jobType = jobType;
  }

  let result = Job.find(queryObject);

  // sort criteria
  if (sort === "latest") {
    result = result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result = result.sort("createdAt");
  }
  if (sort === "a-z") {
    result = result.sort("position");
  }
  if (sort === "z-a") {
    result = result.sort("-position");
  }

  // pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const jobs = await result;

  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);

  // allJobs = await Job.find({ createdBy: req.user.userId }).sort("createdAt");
  res.status(StatusCodes.OK).json({ jobs, numOfPages, totalJobs });
};

// get a new job with id and createdBy
const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req; //* nested destructuring obj

  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  });

  if (!job) {
    throw new NotFoundError(`Job ${jobId} not found`);
  }

  res.status(StatusCodes.OK).json({ job });
};

// create a new job
const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId; // added user id to req.body for identification
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

// update a job
const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req; // all this can be deconstructed separately from the req object for easy readability

  if (company === "" || position === "") {
    throw new BadRequestError(`Company and position is required`);
  }

  const job = await Job.findByIdAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true },
  );

  if (!job) {
    throw new NotFoundError(`Job not found with id ${jobId}`);
  }

  res.status(StatusCodes.OK).json({ job });
};

// delete a job
const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  if (!jobId) {
    throw new BadRequestError(`Job not found with id ${jobId}`);
  }

  const job = await Job.findByIdAndDelete({ _id: jobId, createdBy: userId });

  res.status(StatusCodes.OK).json({ job, deleted: job ? true : false });
};

// showStats

const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  console.log(stats);

  const defaultStats = {
    // failsafe for when there's no stats available
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications: [] });
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
};
