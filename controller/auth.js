const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const SALT_ROUDS = 10;


const signup = async (req, res) => {
  try {



    const userInDatabase = await User.findOne({ 
      $or: [{ phone: req.body.phone }, { username: req.body.username }] 
    });


    if (userInDatabase) {
      return res.status(409).json({ err: "Username or phone number already exists" });
    }


    const hashedPassword = bcrypt.hashSync(req.body.password, SALT_ROUDS);
    req.body.password = hashedPassword;


    const user = await User.create(req.body);
    
    const payload = {
      username: user.username,
      phone: user.phone,
      role: user.role,
      _id: user._id,
    };




    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.status(201).json({ user, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "something went wrong" });
  }
};