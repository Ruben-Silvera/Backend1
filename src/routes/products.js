import express from 'express';
import { body, validationResult } from 'express-validator';
import Product from '../models/product.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort = 'price', query } = req.query;

    const filter = {};
    if (query) {
        filter.category = query.category ? query.category : undefined;
        filter.available = query.available !== undefined ? query.available === 'true' : undefined;
    }

    try {
        const products = await Product.find(filter)
            .sort({ [sort]: 1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .populate('category')
            .exec();

        const total = await Product.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            status: 'success',
            payload: products,
            totalPages,
            currentPage: page,
            total,
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.post('/', [
    body('title').notEmpty().withMessage('Title is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('category').notEmpty().withMessage('Category is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        return res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});


export default router;
