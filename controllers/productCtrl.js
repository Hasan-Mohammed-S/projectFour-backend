const Product = require('../models/product');
const Store = require('../models/stores');
const { objectId, text, number, fail } = require('../services/validation');
const { uploadImage, discardImage } = require('../services/imageService');

const publicStores = () => {
  return Store.find({
    isActive: true,
    archived: { $ne: true }
  }).distinct('_id');
};

const index = async (req, res) => {
  const stores = await publicStores();
  
  const filter = {
    archived: { $ne: true },
    store: { $in: stores }
  };

  if (req.query.store) {
    filter.store = {
      $in: stores.filter((s) => String(s) === objectId(req.query.store, 'store'))
    };
  }

  const products = await Product.find(filter)
    .populate('store')
    .sort({ createdAt: -1 });

  res.json(products);
};

const mine = async (req, res) => {
  const stores = await Store.find({
    owner: req.user._id,
    archived: { $ne: true }
  }).distinct('_id');

  const products = await Product.find({
    store: { $in: stores },
    archived: { $ne: true }
  })
    .populate('store')
    .sort({ createdAt: -1 });

  res.json(products);
};

const show = async (req, res) => {
  const p = await Product.findOne({
    _id: objectId(req.params.id),
    archived: { $ne: true }
  }).populate('store');

  if (!p || !p.store || p.store.archived || !p.store.isActive) {
    fail(404, 'Product is unavailable.');
  }

  res.json(p);
};

function fields(body) {
  return {
    name: text(body.name, 'Product name', 150),
    description: text(body.description, 'Description'),
    category: text(body.category, 'Category', 80),
    price: number(body.price, 'Price'),
    stock: number(body.stock, 'Stock', true)
  };
}

async function ownedStore(id, user) {
  const store = await Store.findOne({
    _id: objectId(id, 'store'),
    owner: user._id,
    archived: { $ne: true }
  });

  if (!store) {
    fail(403, 'You can only manage products in your own stores.');
  }

  return store;
}

const create = async (req, res) => {
  await ownedStore(req.body.store, req.user);
  
  const values = fields(req.body);
  const image = await uploadImage(req.file);

  try {
    const product = await Product.create({
      ...values,
      ...image,
      store: req.body.store
    });
    
    const populatedProduct = await product.populate('store');
    res.status(201).json(populatedProduct);
  } catch (e) {
    await discardImage(image);
    throw e;
  }
};

const update = async (req, res) => {
  const p = await Product.findOne({
    _id: objectId(req.params.id),
    archived: { $ne: true }
  });

  if (!p) {
    fail(404, 'Product not found.');
  }

  await ownedStore(String(p.store), req.user);

  if (
    !Number.isSafeInteger(req.body.version) &&
    !(typeof req.body.version === 'string' && /^\d+$/.test(req.body.version))
  ) {
    fail(400, 'Product version is required. Refresh and try again.');
  }

  const values = fields(req.body);
  const image = await uploadImage(req.file);

  try {
    const updated = await Product.findOneAndUpdate(
      {
        _id: p._id,
        __v: Number(req.body.version),
        archived: { $ne: true }
      },
      {
        $set: { ...values, ...image },
        $inc: { __v: 1 }
      },
      { returnDocument: 'after', runValidators: true }
    ).populate('store');

    if (!updated) {
      fail(409, 'This product changed while you were editing. Refresh to use its latest stock.');
    }

    res.json(updated);
  } catch (e) {
    await discardImage(image);
    throw e;
  }
};

const destroy = async (req, res) => {
  const p = await Product.findById(objectId(req.params.id));

  if (!p) {
    fail(404, 'Product not found.');
  }

  await ownedStore(String(p.store), req.user);

  await Product.updateOne(
    { _id: p._id },
    { 
      $set: { archived: true }, 
      $inc: { __v: 1 } 
    }
  );

  res.json({ message: 'Product removed from the catalog. Existing order records are preserved.' });
};

module.exports = {
  index,
  mine,
  show,
  create,
  update,
  destroy
};