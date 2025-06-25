// ADVERT DATABASE SCHEMA
const mongoose = require('mongoose');

const advertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
         // this removes any extra spaces from the beginning and end of the title
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 10 
        // minimum price is 10 - prevents people from posting free or very cheap spam ads
    },
    category: {
        type: String,
        required: true
    },
    condition: {
        type: String,
        required: true,
        enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
        // predefined condition options to maintain consistency
    },
    available: {
        type: Boolean,
        default: true
        // indicates if the item is still available for purchase - defaults to true when advert is created
    },
    image: {
        type: String,
        // Stores the URL/path to the advertisement's image (not the actual image file)
        default: '',
        // if no image is provided, it defaults to an empty string
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        // this links to the User who created this advert (specifically, which user posted this advert).
        ref: 'User',
        required: true
        // Every advert must have a vendor, Can't create an advert without knowing who posted it
    }
}, {
    timestamps: true, 
    // this automatically adds createdAt and updatedAt fields to track when adverts are posted/modified
});

// how users can search for adverts
advertSchema.index({title: 'text', description: 'text'});
// The index enables full-text search capabilities on the specific fields of your advert documents. This allows users to search for advertisements using natural language queries.

module.exports = mongoose.model('Advert', advertSchema)