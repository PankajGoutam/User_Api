const jwt = require('jsonwebtoken');

const authenticateUser = async (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["authorization"];

  if (!token) {
    return res.status(403).json({
      success: false,
      msg: 'Token is required for authentication',
    });
  }

  try {
    // Extract the Bearer token
    const bearer = token.split(' ');
    const bearerToken = bearer[1];  

    // Verify the token
    const decodedData = jwt.verify(bearerToken, process.env.JWT_SECRET);

    // Attach the user data from the decoded token to the request object
    req.user = decodedData.user;

  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid Token',
    });
  }

  // Proceed to the next middleware or route handler
  return next();
};

module.exports = {
  authenticateUser
};
