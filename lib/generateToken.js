import  jwt  from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generateToken = async (userId) => {
  return  jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: "1h" });
};

export default generateToken;
