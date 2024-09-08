import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const productsFilePath = path.resolve('data', 'productos.json');
let products = [];
let nextId = 1;

if (fs.existsSync(productsFilePath)) {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    products = JSON.parse(data);
    nextId = products.length ? Math.max(products.map(p => p.id)) + 1 : 1;
}

const saveProductsToFile = () => {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};


router.get('/', (req, res) => {
    const { limit } = req.query;
    const limitedProducts = limit ? products.slice(0, parseInt(limit)) : products;
    res.json(limitedProducts);
});


router.get('/:pid', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.pid));
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
});


router.post('/', (req, res) => {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios, excepto thumbnails.' });
    }

    const newProduct = {
        id: nextId++,
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    };

    products.push(newProduct);
    saveProductsToFile();
    res.status(201).json(newProduct);
});


router.put('/:pid', (req, res) => {
    const index = products.findIndex(p => p.id === parseInt(req.params.pid));
    if (index === -1) return res.status(404).json({ message: 'Producto no encontrado' });

    const updatedProduct = { ...products[index], ...req.body };
    if (req.body.id) delete updatedProduct.id;

    products[index] = updatedProduct;
    saveProductsToFile();
    res.json(updatedProduct);
});


router.delete('/:pid', (req, res) => {
    const index = products.findIndex(p => p.id === parseInt(req.params.pid));
    if (index === -1) return res.status(404).json({ message: 'Producto no encontrado' });

    products.splice(index, 1);
    saveProductsToFile();
    res.status(204).end();
});

export default router;
