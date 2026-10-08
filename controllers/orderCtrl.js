const Order = require('../models/order');
const Store = require('../models/stores');
const { objectId, fail } = require('../services/validation');
const { placeOrder } = require('../services/orderService');

async function scope(user) {
  if (user.role === 'buyer') {
    return { user: user._id };
  }
  
  if (user.role === 'seller') {
    const storeIds = await Store.find({ owner: user._id }).distinct('_id');
    return { store: { $in: storeIds } };
  }
  
  return {};
}

const display = (query) => {
  return query
    .select('-checkoutKey -requestHash')
    .populate('store', 'name image address')
    .populate('user', 'username phoneNumber');
};

const index = async (req, res) => {
  const userScope = await scope(req.user);
  const orders = await display(Order.find(userScope).sort({ createdAt: -1 }));
  
  res.json(orders);
};

const byStore = async (req, res) => {
  const store = await Store.findOne({
    _id: objectId(req.params.storeId),
    owner: req.user._id
  });

  if (!store) {
    fail(403, 'You can only view orders for your own store.');
  }

  const orders = await display(Order.find({ store: store._id }).sort({ createdAt: -1 }));
  res.json(orders);
};

const show = async (req, res) => {
  const userScope = await scope(req.user);
  const order = await display(
    Order.findOne({
      ...userScope,
      _id: objectId(req.params.id)
    })
  );

  if (!order) {
    fail(404, 'Order not found.');
  }

  res.json(order);
};

const create = async (req, res) => {
  const result = await placeOrder(
    req.user,
    req.body,
    req.get('Idempotency-Key')
  );

  const order = await display(Order.findById(result.order._id));
  res.status(result.replay ? 200 : 201).json(order);
};

const update = async (req, res) => {
  if (req.user.role !== 'seller') {
    fail(403, 'Only the store owner can update order status.');
  }

  const userScope = await scope(req.user);
  const order = await Order.findOne({
    ...userScope,
    _id: objectId(req.params.id)
  });

  if (!order) {
    fail(404, 'Order not found.');
  }

  if (req.body.status === order.status) {
    const unchangedOrder = await display(Order.findById(order._id));
    return res.json(unchangedOrder);
  }

  const statusTransitions = {
    pending: 'preparing',
    processing: 'ready',
    preparing: 'ready',
    ready: 'completed'
  };
  
  const next = statusTransitions[order.status];

  if (!next || req.body.status !== next) {
    fail(400, 'Move orders forward from Preparing to Ready / On the Way, then Completed.');
  }

  const updated = await display(
    Order.findOneAndUpdate(
      { _id: order._id, status: order.status },
      {
        $set: { status: next },
        $push: { statusHistory: { status: next, changedAt: new Date() } }
      },
      { returnDocument: 'after', runValidators: true }
    )
  );

  if (!updated) {
    fail(409, 'Order status changed. Refresh to see the latest status.');
  }

  res.json(updated);
};

const destroy = async () => {
  fail(405, 'Order records cannot be deleted.');
};

module.exports = {
  index,
  byStore,
  show,
  create,
  update,
  destroy
};