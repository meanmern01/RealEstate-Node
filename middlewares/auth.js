const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
function auth(req, res, next) {
  let authHeader = req.header("Authorization");

  if (!authHeader) {
    res.status(401).json({ message: "Unauthenticated", success: false });
  } else {
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthenticated", success: false });
    } else {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
      } catch (error) {
        res.status(400).json({ message: "Unauthenticated", success: false });
      }
    }
  }
}

module.exports = auth;
