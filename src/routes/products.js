import express from 'express';
import { body, validationResult } from 'express-validator';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { limit = 10, page = 1, query = '', sort } = req.query;
    const options = {
        limit: parseInt(limit),
        skip: (page - 1) * limit,
    };

    const filter = query ? { category: query } : {};
    const products = await Product.find(filter, null, options);
    const total = await Product.countDocuments(filter);

    const totalPages = Math.ceil(total / limit);
    res.json({
        status: 'success',
        payload: products,
        totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
        page: parseInt(page),
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevLink: page > 1 ? `/api/products?limit=${limit}&page=${page - 1}` : null,
        nextLink: page < totalPages ? `/api/products?limit=${limit}&page=${page + 1}` : null,
    });
});

router.post('/', [
    body('title').notEmpty().withMessage('El nombre es obligatorio'),
    body('price').isNumeric().withMessage('El precio debe ser un número'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ message: 'Producto creado', product: newProduct });
});

router.put('/:pid', [
    body('title').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('price').optional().isNumeric().withMessage('El precio debe ser un número'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const product = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto actualizado', product });
});

router.delete('/:pid', async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.pid);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
});

export default router;
