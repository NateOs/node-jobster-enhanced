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
  const { name, lastName, email, location } = req.body;
  console.log(req.user);

  if (!name || !email || !lastName || !location) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ _id: req.user.userId });

  user.name = name;
  user.email = email;
  user.lastName = lastName;
  user.location = location;

  await user.save();
  /* whenever this hook is called, preSave and postSaved are called, preSave hashes a new password in our app so after the hook the user cannot login, either flush all data or fix bug.*/
  // the fix: check that password is not modified on preSave fxn and and esc the hashing.
  // otherwise, use findById and Update user instead.
  const token = user.createJWT(); // if you haven't changed any values, perhaps you dont need to send a new token

  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      location: user.location,
      token,
    },
  });
};

module.exports = {
  register,
  login,
  updateUser,
};
