module.exports = (error, req, res, _next) => {
  let status = error.status || 500;
  let message = (status < 500 || error.expose) 
    ? error.message 
    : 'Something went wrong. Please try again.';

  if (error.code === 11000) {
    status = 409;
    message = 'That username, email, phone number, or store name is already in use.';
  }

  if (error.name === 'ValidationError') {
    status = 400;
    message = Object.values(error.errors)
      .map(e => e.message)
      .join(' ');
  }

  if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier or field value.';
  }

  if (error.name === 'MulterError') {
    status = 400;
    message = error.code === 'LIMIT_FILE_SIZE' 
      ? 'Images must be 5 MB or smaller.' 
      : 'Upload one image using the image field.';
  }

  if (error.message === 'Only JPG, PNG, and WebP images are allowed.') {
    status = 400;
    message = error.message;
  }

  if (status >= 500) {
    console.error('Request failed:', error.name, 'status:', status);
  }

  res.status(status).json({ error: message });
};