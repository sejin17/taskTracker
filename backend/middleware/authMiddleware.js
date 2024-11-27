// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware to check for a valid token
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using your secret
        req.user = decoded; // Attach the user information to the request object
        next(); // Call the next middleware or route handler
    } catch (error) {
        return res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;