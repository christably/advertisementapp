const Joi = require("joi");

// validating request using joi
const validateSignUp = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        role: Joi.string().valid('user', 'vendor').default('user')
       
    });
    
    const {error} = schema.validate(req.body);
    if(error){
        return res.status(400).json({
            message: error.details[0].message
            // this sends back the first validation error message to help user fix their input
        });
    }
    next();
     // if validation passes, move to the next middleware or route handler
};

const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
        // for login we only need email in correct format and any password (we'll check if it matches in the controller)
    });
    
    const {error} = schema.validate(req.body);
    if(error){
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
};

const validateAdvert = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(100).required(),
        description: Joi.string().required(),
        price: Joi.number().positive().required(),
        category: Joi.string().required(),
        condition: Joi.string().required(),
        available: Joi.boolean().required()

       
    });
    
    const {error} = schema.validate(req.body);
    if(error){
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
};

module.exports = {
    validateSignUp,
    validateLogin,
    validateAdvert
};