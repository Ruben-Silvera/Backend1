import express from 'express';
import mongoose from 'mongoose';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();
const PORT = process.env.PORT || 8080;

mongoose.connect('mongodb://localhost:27017/tu_basededatos', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'API de Productos y Carritos',
            version: '1.0.0',
            description: 'API para gestionar productos y carritos',
        },
    },
    apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
