const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      unique: true
    },
    description: {
      type: String,
      required: [true, 'Store description is required'],
      trim: true
    },
    image: {
      type: String,
      required: false
    },
    address: {
      type: String,
      required: [true, 'Store address is required'],
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
    }
);

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;