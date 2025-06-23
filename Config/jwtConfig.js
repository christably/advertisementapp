//  this sets up authentication tokens, temporary ID cards for users. when a user logs in , they get a token to prove who they are. Tokens expire for security so users need to refresh or log in  again.
const jwt = require('jsonwebtoken');
require("dotenv").config();

const generateToken = (payload)=>{
    return jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn: '1h'
    });
}

const verifyToken = (token)=>{
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken
}