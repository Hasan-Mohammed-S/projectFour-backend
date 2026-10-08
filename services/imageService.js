const cloudinary = require('../config/cloudinary');
const { fail } = require('./validation');

async function uploadImage(file) {
  if (!file) {
    return {};
  }

  if (
    ![
      process.env.CLOUDINARY_CLOUD_NAME,
      process.env.CLOUDINARY_API_KEY,
      process.env.CLOUDINARY_API_SECRET
    ].every(Boolean)
  ) {
    fail(503, 'Image uploads are not configured. Please contact the store administrator.');
  }

  const b = file.buffer;
  
  const jpg = b.length > 3 && b[0] === 255 && b[1] === 216 && b[2] === 255;
  const png = b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const webp = b.length >= 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP';

  if (!jpg && !png && !webp) {
    fail(400, 'Upload a valid JPG, PNG, or WebP image.');
  }

  try {
    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          folder: 'handmade-market', 
          resource_type: 'image', 
          timeout: 30000 
        }, 
        (error, result) => {
          if (error) {
            return reject(error);
          }
          
          if (!result?.secure_url || !result?.public_id) {
            return reject(new Error('Invalid upload response'));
          }
          
          resolve({ 
            image: result.secure_url, 
            imagePublicId: result.public_id 
          });
        }
      );
      
      stream.end(b);
    });
  } catch {
    fail(502, 'The image could not be uploaded. Please try again.');
  }
}

async function discardImage(fields) {
  if (fields.imagePublicId) {
    await cloudinary.uploader.destroy(fields.imagePublicId).catch(() => {});
  }
}

module.exports = {
  uploadImage,
  discardImage
};