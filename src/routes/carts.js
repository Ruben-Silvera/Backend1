import express from 'express';
import Cart from '../models/Cart.js';

const router = express.Router();

router.get('/:cid', async (req, res) => {
    const cart = await Cart.findById(req.params.cid).populate('products.productId');
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });
    if (cart.products.length === 0) return res.status(404).json({ message: 'El carrito está vacío' });
    res.json(cart);
});

router.post('/', async (req, res) => {
    const newCart = new Cart(req.body);
    await newCart.save();
    res.status(201).json({ message: 'Carrito creado', cart: newCart });
});

router.put('/:cid/products/:pid', async (req, res) => {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    const productIndex = cart.products.findIndex(p => p.productId.toString() === req.params.pid);
    if (productIndex === -1) return res.status(404).json({ message: 'Producto no encontrado en el carrito' });

    cart.products[productIndex].quantity = req.body.quantity;
    await cart.save();
    res.json({ message: 'Cantidad actualizada', cart });
});

router.delete('/:cid/products/:pid', async (req, res) => {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    const productIndex = cart.products.findIndex(p => p.productId.toString() === req.params.pid);
    if (productIndex === -1) return res.status(404).json({ message: 'Producto no encontrado en el carrito' });

    cart.products.splice(productIndex, 1);
    await cart.save();
    res.json({ message: 'Producto eliminado del carrito', cart });
});

router.delete('/:cid', async (req, res) => {
    const cart = await Cart.findByIdAndDelete(req.params.cid);
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });
    res.json({ message: 'Carrito eliminado' });
});

export default router;
