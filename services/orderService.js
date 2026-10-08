const crypto = require('node:crypto');
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const Store = require('../models/stores');
const { objectId, text, fail } = require('./validation');

function checkoutRequest(body, key) {
  const store = objectId(body.store, 'store');
  const shippingAddress = text(body.shippingAddress, 'Delivery address', 500);

  if (typeof key !== 'string' || !/^[a-zA-Z0-9_-]{16,100}$/.test(key)) {
    fail(400, 'A valid checkout key is required.');
  }

  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 100) {
    fail(400, 'Choose between 1 and 100 cart items.');
  }

  const quantities = new Map();

  for (const item of body.items) {
    const id = objectId(item?.product, 'product');

    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000000) {
      fail(400, 'Quantities must be positive whole numbers.');
    }

    const quantity = (quantities.get(id) || 0) + item.quantity;

    if (!Number.isSafeInteger(quantity) || quantity > 1000000) {
      fail(400, 'Quantity is too large.');
    }

    quantities.set(id, quantity);
  }

  const items = [...quantities]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([product, quantity]) => ({ product, quantity }));

  return {
    store,
    shippingAddress,
    items,
    key,
    hash: crypto
      .createHash('sha256')
      .update(JSON.stringify({ store, shippingAddress, items }))
      .digest('hex')
  };
}

function checkReplay(order, input) {
  if (order.requestHash !== input.hash) {
    fail(409, 'This checkout key was already used for a different order. Refresh your cart.');
  }
  
  return order;
}

async function placeOrder(user, body, key) {
  if (user.role !== 'buyer') {
    fail(403, 'Only buyer accounts can place orders. Store owners cannot purchase their own products.');
  }

  const input = checkoutRequest(body, key);
  const existing = await Order.findOne({ user: user._id, checkoutKey: key });

  if (existing) {
    return { order: checkReplay(existing, input), replay: true };
  }

  const session = await mongoose.startSession();
  let created;

  try {
    await session.withTransaction(async () => {
      const replay = await Order.findOne({ user: user._id, checkoutKey: key }).session(session);
      
      if (replay) {
        created = { order: checkReplay(replay, input), replay: true };
        return;
      }

      const store = await Store.findOneAndUpdate(
        { 
          _id: input.store, 
          isActive: true, 
          archived: { $ne: true }, 
          owner: { $ne: user._id } 
        },
        { $set: { lastOrderAt: new Date() } },
        { returnDocument: 'after', session }
      );

      if (!store) {
        fail(409, 'This store is unavailable or belongs to your account.');
      }

      const items = [];
      let totalCents = 0;

      for (const requested of input.items) {
        const product = await Product.findOneAndUpdate(
          { 
            _id: requested.product, 
            store: store._id, 
            archived: { $ne: true }, 
            stock: { $gte: requested.quantity } 
          },
          { $inc: { stock: -requested.quantity, __v: 1 } },
          { returnDocument: 'after', session }
        );

        if (!product) {
          fail(409, 'A product is unavailable or has insufficient stock. Refresh your cart and adjust the quantity.');
        }

        if (
          !Number.isFinite(product.price) || 
          product.price < 0 || 
          Math.abs(product.price * 100 - Math.round(product.price * 100)) > 0.000001
        ) {
          fail(409, 'A product price needs updating by its seller.');
        }

        const cents = Math.round(product.price * 100);
        const subtotalCents = cents * requested.quantity;
        totalCents += subtotalCents;

        if (!Number.isSafeInteger(totalCents)) {
          fail(400, 'Order total is too large.');
        }

        items.push({
          product: product._id,
          productName: product.name,
          image: product.image || '',
          imagePublicId: product.imagePublicId || '',
          quantity: requested.quantity,
          price: cents / 100,
          subtotal: subtotalCents / 100
        });
      }

      const [order] = await Order.create(
        [{
          user: user._id,
          store: store._id,
          storeName: store.name,
          customerName: user.username,
          customerPhone: user.phoneNumber,
          items,
          totalAmount: totalCents / 100,
          shippingAddress: input.shippingAddress,
          checkoutKey: input.key,
          requestHash: input.hash,
          status: 'preparing',
          statusHistory: [{ status: 'preparing' }]
        }],
        { session }
      );

      created = { order, replay: false };
    });

    return created;
  } catch (error) {
    if (error.code === 11000) {
      const replay = await Order.findOne({ user: user._id, checkoutKey: key });
      
      if (replay) {
        return { order: checkReplay(replay, input), replay: true };
      }
    }
    
    if (error.code === 20 || /Transaction numbers are only allowed/.test(error.message)) {
      fail(503, 'Checkout requires MongoDB Atlas or a replica set. Contact the administrator.');
    }
    
    throw error;
  } finally {
    await session.endSession();
  }
}

module.exports = {
  placeOrder,
  checkoutRequest
};