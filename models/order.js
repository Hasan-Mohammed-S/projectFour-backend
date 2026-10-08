const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    store: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Store', 
      required: true 
    },
    storeName: { type: String, required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    items: [
      {
        product: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Product', 
          required: true 
        },
        productName: { type: String, required: true, trim: true },
        image: String,
        imagePublicId: String,
        quantity: { 
          type: Number, 
          required: true, 
          min: 1, 
          validate: Number.isSafeInteger 
        },
        price: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, required: true, min: 0 }
      }
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { 
      type: String, 
      enum: [
        'preparing', 
        'ready', 
        'completed', 
        'pending', 
        'processing', 
        'cancelled'
      ], 
      default: 'preparing' 
    },
    shippingAddress: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 500 
    },
    checkoutKey: String,
    requestHash: String,
    statusHistory: [
      { 
        status: String, 
        changedAt: { type: Date, default: Date.now } 
      }
    ]
  }, 
  { timestamps: true }
);

orderSchema.index(
  { user: 1, checkoutKey: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { checkoutKey: { $type: 'string' } } 
  }
);

orderSchema.index({ store: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);