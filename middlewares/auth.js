const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const auth = async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).send({ error: "Please authenticate" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SCRETE);
    req.userId = decoded.userId;
    req.role = decoded.role;
    // req.user = decoded.user;
    const userDoc = await User.findById(decoded.userId);      
    if (!userDoc) return res.status(401).json({ message: "User not found" });
    req.user = userDoc;

    next();
  } catch (error) {
    console.log("please please authenticate ", error);
    res
      .status(401)
      .send({ error: "Please authenticate", message: error.message });
  }
};

module.exports = auth;
