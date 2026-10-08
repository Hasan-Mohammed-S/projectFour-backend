const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 150 
    },
    description: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 3000 
    },
    price: { 
      type: Number, 
      required: true, 
      min: 0, 
      max: 1000000,
      validate: v => Number.isFinite(v) && Math.abs(v * 100 - Math.round(v * 100)) < 0.000001 
    },
    category: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 80 
    },
    stock: { 
      type: Number, 
      required: true, 
      default: 0, 
      min: 0, 
      max: 1000000, 
      validate: Number.isSafeInteger 
    },
    store: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Store', 
      required: true 
    },
    image: { 
      type: String, 
      default: '' 
    },
    imagePublicId: { 
      type: String, 
      default: '' 
    },
    archived: { 
      type: Boolean, 
      default: false 
    }
  }, 
  { timestamps: true }
);

productSchema.index({ store: 1, archived: 1 });

module.exports = mongoose.model('Product', productSchema);