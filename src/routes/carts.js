import express from 'express';
import Cart from '../models/Cart.js';

const router = express.Router();

router.get('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.productId');
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Cart not found' });
        }
        return res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await Cart.findByIdAndUpdate(
            req.params.cid,
            { $pull: { products: { productId: req.params.pid } } },
            { new: true }
        ).populate('products.productId');
        
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Cart not found' });
        }
        
        return res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

router.put('/:cid', async (req, res) => {
    const { products } = req.body;
    try {
        const updatedCart = await Cart.findByIdAndUpdate(
            req.params.cid,
            { products },
            { new: true }
        ).populate('products.productId');

        if (!updatedCart) {
            return res.status(404).json({ status: 'error', message: 'Cart not found' });
        }

        return res.status(200).json({ status: 'success', payload: updatedCart });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});


export default router;
