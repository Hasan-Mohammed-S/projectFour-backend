const Store = require('../models/stores');



const index = async (req, res) => {
    try {
        const stores = await Store.find({});
        res.status(200).json(stores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




const show = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.status(200).json(store);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const create = async (req, res) => {
    try {
        const newStore = await Store.create(req.body);
        res.status(201).json(newStore);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



const update = async (req, res) => {
    try {
        const updatedStore = await Store.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!updatedStore) {
            return res.status(404).json({ message: 'Store not found for update' });
        }
        res.status(200).json(updatedStore);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};




const destroy = async (req, res) => {
    try {
        const deletedStore = await Store.findByIdAndDelete(req.params.id);
        if (!deletedStore) {
            return res.status(404).json({ message: 'Store not found for deletion' });
        }
        res.status(200).json({ message: 'Store deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    index,
    show,
    create,
    update,
    destroy
};