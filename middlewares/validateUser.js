export const validateUser = (req, res, next) => {
  const userpassword = req.headers["password"];
  const validPassword = "password123";
  if (userpassword === validPassword) {
    next();
  } else {
    res.status(400).json("Invalid password, unauthorized access ");
  }
};
