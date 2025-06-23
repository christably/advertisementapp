const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./Config/dbConfig');
const errorHandler = require('./Middlewares/errorHandler');
const authRoutes = require('./Routes/authRoutes');
const advertRoutes = require('./Routes/advertRoutes');
const {sendEmail} = require('./Utilities/email')
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

app.post('/api/send-plain-email', async(req,res)=>{
    try {
        console.log("Attempting to send plain text email...");

        const result = await sendEmail(
            "codepeeps4@gmail.com",
            "Plain Text as requested",
            "Hello Richman, this is the assignment",
            null 
            // null represents that theres no html content. html is use when you want to send a template.
        );
        
        console.log("Email result:", result);
        
        if (result && result.success) {
            res.status(200).json({
                message: "Plain text email sent successfully to Paul!",
                messageId: result.messageId
            });
        } else {
    
            res.status(500).json({
                message: "Failed to send plain text email",
                error: result ? result.error.toString() : "Unknown error occurred"
            });
        }
        
    } catch (error) {
        
        console.error("Server error:", error);
        res.status(500).json({
            message: "Server error occurred",
            error: error.toString()
        });
    }
});

app.use(errorHandler);

// catch-all 404 error handler
app.use('/*', (req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});
