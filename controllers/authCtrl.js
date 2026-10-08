const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { text, fail } = require('../services/validation');

function details(body) {
  return {
    username: text(body.username, 'Username', 50),
    phoneNumber: text(body.phoneNumber, 'Phone number', 20),
    email: text(body.email, 'Email', 254).toLowerCase()
  };
}

function tokenFor(user) {
  return jwt.sign(
    { _id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '8h', algorithm: 'HS256' }
  );
}

const signup = async (req, res) => {
  const values = details(req.body);
  const role = req.body.role || 'buyer';

  if (!['buyer', 'seller'].includes(role)) {
    fail(400, 'Choose a buyer or seller account.');
  }

  if (
    typeof req.body.password !== 'string' ||
    req.body.password.length < 8 ||
    Buffer.byteLength(req.body.password) > 72
  ) {
    fail(400, 'Password must contain at least 8 characters and at most 72 bytes.');
  }

  const user = await User.create({
    ...values,
    role,
    password: await bcrypt.hash(req.body.password, 12)
  });

  res.status(201).json({ user, token: tokenFor(user) });
};

const login = async (req, res) => {
  const identifier = text(
    req.body.identifier || req.body.phoneNumber || req.body.email || req.body.username,
    'Username, email, or phone number',
    254
  );

  if (typeof req.body.password !== 'string') {
    fail(400, 'Password is required.');
  }

  const user = await User.findOne({
    $or: [
      { username: identifier },
      { email: identifier.toLowerCase() },
      { phoneNumber: identifier }
    ]
  }).select('+password');

  if (
    !user ||
    user.isActive === false ||
    !(await bcrypt.compare(req.body.password, user.password))
  ) {
    fail(401, 'Invalid credentials.');
  }

  res.json({ user, token: tokenFor(user) });
};

const me = async (req, res) => {
  res.json(req.user);
};

const updateProfile = async (req, res) => {
  Object.assign(req.user, details(req.body));
  await req.user.save();
  res.json(req.user);
};

const logout = async (req, res) => {
  res.json({ message: 'Signed out. Remove the token from this device.' });
};

module.exports = {
  signup,
  login,
  me,
  updateProfile,
  logout
};