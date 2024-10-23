import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    available: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
