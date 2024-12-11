import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()

export const validateJWT = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) return res.status(401).json("Access denied, token missing");

    const verified = jwt.verify(token, process.env.SECRET_KEY);

    if (!verified)
      return res.status(401).json("invalid token, auhtorization denied");

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
