var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventory');

// GET all inventories
router.get('/', async (req, res) => {
    try {
        let inventories = await inventoryModel.find().populate('product');
        res.status(200).send(inventories);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET inventory by ID
router.get('/:id', async (req, res) => {
    try {
        let inventory = await inventoryModel.findById(req.params.id).populate('product');
        if (!inventory) return res.status(404).send({ message: "Inventory not found" });
        res.status(200).send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Add stock
router.post('/add-stock', async (req, res) => {
    try {
        const { product, quantity } = req.body;
        let inventory = await inventoryModel.findOneAndUpdate(
            { product: product },
            { $inc: { stock: quantity } },
            { new: true }
        );
        if (!inventory) return res.status(404).send({ message: "Inventory for product not found" });
        res.status(200).send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Remove stock
router.post('/remove-stock', async (req, res) => {
    try {
        const { product, quantity } = req.body;
        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) return res.status(404).send({ message: "Inventory for product not found" });
        
        if (inventory.stock < quantity) {
            return res.status(400).send({ message: "Insufficient stock" });
        }

        inventory.stock -= quantity;
        await inventory.save();
        res.status(200).send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Reservation
router.post('/reservation', async (req, res) => {
    try {
        const { product, quantity } = req.body;
        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) return res.status(404).send({ message: "Inventory for product not found" });

        if (inventory.stock < quantity) {
            return res.status(400).send({ message: "Insufficient stock for reservation" });
        }

        inventory.stock -= quantity;
        inventory.reserved += quantity;
        await inventory.save();
        res.status(200).send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Sold
router.post('/sold', async (req, res) => {
    try {
        const { product, quantity } = req.body;
        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) return res.status(404).send({ message: "Inventory for product not found" });

        if (inventory.reserved < quantity) {
            return res.status(400).send({ message: "Insufficient reserved stock" });
        }

        inventory.reserved -= quantity;
        inventory.soldCount += quantity;
        await inventory.save();
        res.status(200).send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
