const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//* register new user
const register = async (req, res) => {
  // const { name, email, password } = req.body;
  // if (!email || !password || !name) {  // redundant validation because of mongoose validation, still useful on other controllers
  //   throw new BadRequestError("Please supply email, password and name");
  // }
  // create user and send token
  const user = await User.create({ ...req.body });

  // const token = jwt.sign(
  //   { userId: this._id, name: this.name },
  //   process.env.JWT_SECRET,
  //   {
  //     expiresIn: process.env.JWT_LIFETIME,
  //   },
  // );
  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({
    user: {
      name: user.name,
      email: user.email,
      lastname: user.lastname,
      location: user.location,
      token,
    },
  });
};

//* login a user, find existing user, send token
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError(`Please provide a valid email and password`);
  }

  const user = await User.findOne({ email });
  // compare password
  if (!user) {
    throw new UnauthenticatedError("Invalid credentials: User not found");
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      email: user.email,
      lastname: user.lastname,
      location: user.location,
      token,
    },
  });
};

// update user
const updateUser = async (req, res) => {
  console.log(req.user);
  console.log(req.body);
};

module.exports = {
  register,
  login,
  updateUser,
};
