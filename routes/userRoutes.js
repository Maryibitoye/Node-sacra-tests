import express from "express";
import {
  createUser,
  getAllUser,
  getSingleUser,
  loginUser,
  updateUser,
  sendOTP,
  deleteUser,
  loginWithOTP,

} from "../controller/userController.js";
import { validateJWT } from "../middlewares/validateJWT.js";
import validateOTP from "../middlewares/validateOTP.js";

const router = express.Router();

// router.get("/", (req, res) => {
//   res.status(200).send("holla");
// });
router.post("/create", createUser);

router.get("/:id", validateJWT, getSingleUser);
router.get("/", validateJWT, getAllUser);

router.patch("/update/:id", validateJWT, updateUser);
router.post("/login", loginUser);

router.get("/", validateJWT, getAllUser);
router.delete("/delete/:id", validateJWT, deleteUser);
router.post("/send-otp", sendOTP);
router.post("/login-otp", loginWithOTP);
router.post("/login-otp", validateOTP, loginWithOTP)


export default router;
