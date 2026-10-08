const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      maxlength: 150 
    },
    description: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 3000 
    },
    image: { 
      type: String, 
      default: '' 
    },
    imagePublicId: { 
      type: String, 
      default: '' 
    },
    address: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 500 
    },
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    archived: { 
      type: Boolean, 
      default: false 
    },
    lastOrderAt: Date
  }, 
  { timestamps: true }
);

storeSchema.index({ owner: 1 });

module.exports = mongoose.model('Store', storeSchema);