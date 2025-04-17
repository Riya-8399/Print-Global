const jwt = require('jsonwebtoken');

const authenticateUser  = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if token is provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    console.log('🔑 Received Token:', token);
    console.log('🔐 Secret used:', process.env.JWT_SECRET);
    
    try {
        // Verify token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // attach user data to request
        next(); // move to the next middleware/controller
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = {authenticateUser} ;
