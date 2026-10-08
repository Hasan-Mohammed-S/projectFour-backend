const Store = require('../models/stores');
const Product = require('../models/product');
const { objectId, text, fail } = require('../services/validation');
const { uploadImage, discardImage } = require('../services/imageService');

const index = async (req, res) => {
  const stores = await Store.find({
    isActive: true,
    archived: { $ne: true }
  }).sort({ createdAt: -1 });

  res.json(stores);
};

const mine = async (req, res) => {
  const stores = await Store.find({
    owner: req.user._id,
    archived: { $ne: true }
  }).sort({ createdAt: -1 });

  res.json(stores);
};

const show = async (req, res) => {
  const store = await Store.findOne({
    _id: objectId(req.params.id),
    isActive: true,
    archived: { $ne: true }
  });

  if (!store) {
    fail(404, 'Store is unavailable.');
  }

  res.json(store);
};

function fields(body) {
  return {
    name: text(body.name, 'Store name', 150),
    description: text(body.description, 'Description'),
    address: text(body.address, 'Address', 500)
  };
}

const create = async (req, res) => {
  const values = fields(req.body);
  const image = await uploadImage(req.file);

  try {
    const store = await Store.create({
      ...values,
      ...image,
      owner: req.user._id
    });
    
    res.status(201).json(store);
  } catch (e) {
    await discardImage(image);
    throw e;
  }
};

const update = async (req, res) => {
  const store = await Store.findOne({
    _id: objectId(req.params.id),
    owner: req.user._id,
    archived: { $ne: true }
  });

  if (!store) {
    fail(403, 'You can only edit your own store.');
  }

  const values = fields(req.body);
  const image = await uploadImage(req.file);

  try {
    const updated = await Store.findOneAndUpdate(
      {
        _id: store._id,
        owner: req.user._id,
        archived: { $ne: true }
      },
      { 
        $set: { ...values, ...image } 
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updated) {
      fail(409, 'Store is no longer available.');
    }

    res.json(updated);
  } catch (e) {
    await discardImage(image);
    throw e;
  }
};

const destroy = async (req, res) => {
  const store = await Store.findOne({
    _id: objectId(req.params.id),
    owner: req.user._id,
    archived: { $ne: true }
  });

  if (!store) {
    fail(403, 'You can only remove your own store.');
  }

  const hasProducts = await Product.exists({
    store: store._id,
    archived: { $ne: true }
  });

  if (hasProducts) {
    fail(409, 'Remove the store’s products before removing the store.');
  }

  await Store.updateOne(
    { _id: store._id },
    { 
      $set: { archived: true, isActive: false } 
    }
  );

  res.json({ message: 'Store removed. Existing orders are preserved.' });
};

module.exports = {
  index,
  mine,
  show,
  create,
  update,
  destroy
};