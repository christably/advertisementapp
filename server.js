const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./Config/dbConfig');
const errorHandler = require('./Middlewares/errorHandler');
const authRoutes = require('./Routes/authRoutes');
const advertRoutes = require('./Routes/advertRoutes');
require("dotenv").config();

const app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');


connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// This is typically used to serve user-uploaded files (images, documents, etc.) so they can be accessed directly via URL, which is essential for displaying images in web applications or allowing file downloads.

app.use('/api/auth', authRoutes);
app.use('/api/adverts', advertRoutes);

// documentatiom
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


//  "I'm alive and ready to handle requests"
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Server is running successfully'
    });
});

app.use(errorHandler);

// catch-all 404 error handler
app.use('/*', (req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});
