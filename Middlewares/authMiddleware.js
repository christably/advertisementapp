const { verifyToken } = require("../Config/jwtConfig"); 
const User = require("../Models/users");

const auth = async (req, res, next) => {
  try {
    
    const token = req.headers["authorization"]?.replace("Bearer ", ""); 
    // this gets the authorization header from the request and removes 'Bearer ' to get just the token part

    if (!token) {
      return res.status(401).json({
        message: "Authorization denied",
      });
    }

    // verify if the token is valid and decode it to get user info
    const decoded = verifyToken(token);

    // find the user in database using the userId from the token, but don't return the password field
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "Token not valid",
      });
    }

   
    req.user = {
      userId: user._id,   
      role: user.role,
      name: user.name,
      email: user.email,
    };
    
    // this attaches the user info to the request so other functions can access it
    next(); 
    // moves to the next middleware or route handler
  } catch (error) {
    // if anything goes wrong (invalid token, expired token, etc), deny access
    res.status(401).json({
      message: "Token not valid",
    });
  }
};

// vendor authentication middleware - this runs AFTER the auth middleware
const vendorAuth = async (req, res, next) => {
  // this checks if the logged-in user has vendor role, if not they can't access vendor-only routes
  if (req.user.role !== "vendor") {
    return res.status(403).json({
      message: "Vendors Only",
    });
  }
  next(); 
  // if they are a vendor, let them proceed to the actual route
};

module.exports = { auth, vendorAuth };
