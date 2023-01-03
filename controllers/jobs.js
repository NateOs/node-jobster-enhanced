const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

// get all jobs
const getAllJobs = async (req, res) => {
  const allJobs = await Job.find({ createdBy: req.user.userId }).sort(
    "createdAt",
  );
  res.status(StatusCodes.OK).json({ allJobs, count: allJobs.length });
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

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
