const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(
      token,
      "long_string_secret_not_to_be_shared"
    ); //This method returns a decoded token. Express Js allows to add new peices of data to the request object and we can pass it to next
    // middleware
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Auth Failed" });
  }
};
