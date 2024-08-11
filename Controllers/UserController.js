const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { validationResult } = require("express-validator");

const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        errors: errors.array(),
      });
    }

    const {
      name,
      email,
      password,
      dateOfBirth,
      address,
      role = "USER",
    } = req.body;

    const isExistUser = await User.findOne({ email });

    if (isExistUser) {
      return res.status(400).json({
        success: false,
        msg: "Email Already Exist",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      dateOfBirth: new Date(dateOfBirth),
      address,
      role,
    });

    const userData = await user.save();

    return res.status(201).json({
      success: true,
      msg: "User Successfully Created",
      data: userData,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const genetateAccessToken = async (user) => {
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1d" });
  return token;
};

const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).json({
        success: false,
        msg: "User Not Found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        msg: "Email and Password is incorrect!",
      });
    }

    // Sign the JWT with the user's ID and role as the payload
    const token = await genetateAccessToken({
      user: userData,
    });

    return res.status(200).json({
      success: true,
      msg: "Login Successfully",
      token: token,
      tokenType: "Bearer",
      data: userData,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user_id = req.user._id;

    // Fetch the user data from the database
    const userData = await User.findOne({ _id: user_id });

    // Respond with the user profile data
    return res.status(200).json({
      success: true,
      msg: "Profile Data",
      data: userData,
    });
  } catch (error) {
    // Respond with an error message if something goes wrong
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {

    const users = await User.find({
      _id: {
        $ne: req.user._id,
      },
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(400).json({ error: "Error fetching users" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Validation Errors",
        errors: errors.array(),
      });
    }

    const user_id = req.user._id;
    const { name, email, dob, address, password, role } = req.body;

    // Check if the user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "User does not exist!",
      });
    }

    // Prepare the update object
    let updateObj = { name, email, dob, address,role };

    // If a new password is provided, hash it before saving
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateObj.password = hashedPassword;
    }

    // Update the user's profile
    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { $set: updateObj },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      msg: "User profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};



const deleteUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Validation Errors",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    const userData = await User.findOne({ email: email });
    console.log(userData);

    if (!userData) {
      return res.status(400).json({
        success: false,
        msg: "User does not exist!",
      });
    }

    // Check if the authenticated user is an admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Only Admin Can Access This" });
    }

    await User.findOneAndDelete({ email: email });

    return res.status(200).json({
      success: true,
      msg: "User deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};



module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers,
};
