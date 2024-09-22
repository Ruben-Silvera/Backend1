import express from 'express';
import { engine } from 'express-handlebars';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = 8080;

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.get('/', (req, res) => {
    const productsFilePath = path.resolve('data', 'productos.json');
    const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
    res.render('home', { products });
});

const httpServer = createServer(app);
const io = new Server(httpServer);

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('addProduct', (newProduct) => {
        const productsFilePath = path.resolve('data', 'productos.json');
        const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

        const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;

        const productToAdd = {
            id: newId,
            title: newProduct.title,
            description: "Descripción del producto",
            code: "CÓDIGO001",
            price: Number(newProduct.price),
            status: true,
            stock: 10,
            category: "Categoría",
            thumbnails: []
        };

        products.push(productToAdd);
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));

        io.emit('updateProducts', products);
    });

    socket.on('deleteProduct', (productId) => {
        const productsFilePath = path.resolve('data', 'productos.json');
        const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

        const updatedProducts = products.filter(product => product.id !== productId);
        fs.writeFileSync(productsFilePath, JSON.stringify(updatedProducts, null, 2));

        io.emit('updateProducts', updatedProducts);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

httpServer.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
