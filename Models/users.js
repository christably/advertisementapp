const mongoose = require('mongoose');

// USER DATABASE SCHEMA
const regularUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
        // the trim removes leading and trailing whitespace from the string
    },
    email: {
        type: String,
        required: true,
        unique: true,
         // ensures no two users can have the same email address
        lowercase: true
         // automatically converts email to lowercase before saving
    },
    password: {
        type: String,
        required: true
        // this will store the hashed password, never the plain text version
    },
    role: {
        type: String,
        // The field can ONLY contain one of these two values, any other will be rejected and cause a validation error
        enum: ['user', 'vendor'],
        // If no role is specified when creating a user, it automatically gets "user"
        default: 'user'
        // this determines what permissions the user has in the system
    },
}, {
    timestamps: true,
    // this automatically adds createdAt and updatedAt fields to track when the document was first created and when it was last modified
});

module.exports = mongoose.model('User', regularUserSchema);
// This creates a Mongoose model - think of it as a "factory" for creating and managing User documents in MongoDB.