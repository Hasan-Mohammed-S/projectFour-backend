const mongoose = require('mongoose');

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  error.expose = true;
  throw error;
}

function objectId(value, label = 'ID') {
  if (typeof value !== 'string' || !mongoose.isObjectIdOrHexString(value)) {
    fail(400, `Invalid ${label}.`);
  }

  return value;
}

function text(value, label, max = 3000) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    fail(400, `${label} is required (maximum ${max} characters).`);
  }

  return value.trim();
}

function number(value, label, integer = false) {
  if (!['number', 'string'].includes(typeof value) || String(value).trim() === '') {
    fail(400, `${label} is required.`);
  }

  const n = Number(value);

  if (
    !Number.isFinite(n) ||
    n < 0 ||
    n > 1000000 ||
    (integer && !Number.isSafeInteger(n))
  ) {
    fail(
      400,
      `${label} must be a valid ${integer ? 'whole ' : ''}number between 0 and 1,000,000.`
    );
  }

  if (!integer && Math.abs(n * 100 - Math.round(n * 100)) > 0.000001) {
    fail(400, `${label} must have at most two decimal places.`);
  }

  return n;
}

module.exports = {
  fail,
  objectId,
  text,
  number
};