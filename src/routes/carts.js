import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const cartsFilePath = path.resolve('data', 'carrito.json');
let carts = [];
let nextId = 1;

if (fs.existsSync(cartsFilePath)) {
    const data = fs.readFileSync(cartsFilePath, 'utf-8');
    carts = JSON.parse(data);
    nextId = carts.length ? Math.max(carts.map(c => c.id)) + 1 : 1;
}

const saveCartsToFile = () => {
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
};


router.post('/', (req, res) => {
    const newCart = {
        id: nextId++,
        products: []
    };
    carts.push(newCart);
    saveCartsToFile();
    res.status(201).json(newCart);
});


router.get('/:cid', (req, res) => {
    const cart = carts.find(c => c.id === parseInt(req.params.cid));
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });
    res.json(cart.products);
});


router.post('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;
    const cart = carts.find(c => c.id === parseInt(cid));

    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    const productInCart = cart.products.find(p => p.product === pid);

    if (productInCart) {
        productInCart.quantity += 1;
    } else {
        cart.products.push({ product: pid, quantity: 1 });
    }

    saveCartsToFile();
    res.json(cart);
});

export default router;
