const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const SALT_ROUNDS = 10;

const signup = async (req, res) => {
  try {
    const { username, phoneNumber, email, password, role } = req.body;
    
    if (!username || !phoneNumber || !email || !password) {
      return res.status(400).json({ error: "Username, phone number, email, and password are required" });
    }

    const userRole = role || "buyer";
    if (!["buyer", "seller", "admin"].includes(userRole)) {
      return res.status(400).json({ error: "Choose buyer, seller, or admin" });
    }

    const existingUser = await User.findOne({ 
      $or: [{ phoneNumber }, { email }, { username }] 
    });

    if (existingUser) {
      return res.status(409).json({ error: "Username, phone number, or email is already registered" });
    }

    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

    const user = await User.create({ 
      username, 
      phoneNumber, 
      email, 
      password: hashedPassword, 
      role: userRole 
    });

    const token = jwt.sign(
      { username: user.username, phoneNumber: user.phoneNumber, email: user.email, role: user.role, _id: user._id },
      process.env.JWT_SECRET
    );

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const login = async (req, res) => {
  try {
    const { identifier, phoneNumber, email, username, password } = req.body;

    const userIdentifier = identifier || phoneNumber || email || username;

    if (!userIdentifier || !password) {
      return res.status(400).json({ error: "Username, email, or phone number and password are required" });
    }


    const user = await User.findOne({
      $or: [
        { username: userIdentifier },
        { email: userIdentifier },
        { phoneNumber: userIdentifier }
      ]
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials or password" });
    }

    const token = jwt.sign(
      { username: user.username, phoneNumber: user.phoneNumber, email: user.email, role: user.role, _id: user._id },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



const me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.username = req.body.username || user.username;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.email = req.body.email || user.email;
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



const logout = async (req, res) => {
  try {
    return res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  signup,
  login,
  me,
  updateProfile,
  logout,
};