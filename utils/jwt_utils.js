const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    // Get the token from the request headers
    const token = req.headers['authorization'];
  
    // Check if a token was provided
    if (!token) {
      return res.status(401).send({ auth: false, message: 'No token provided.' });
    }
  
    // Verify the token
    jwt.verify(token, "aitfgil", function(err, decoded) {
      if (err) {
        return res.status(500).send({ auth: false, message: 'Failed to authenticate token'+err.toString() });
      }
  
      // If the token is valid, save the decoded user object in the request object
      req.body.userId = decoded.userId;
      next();
    });
  }
  module.exports = verifyToken