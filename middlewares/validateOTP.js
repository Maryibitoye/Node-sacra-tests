import User from "../models/usermodel.js";
import * as OTPAuth from "otpauth";


const validateOTP = async (req, res, next) => {
  try {
    const { otp, email } = req.body;
    if (!email || !otp)
      return res.status(400).json("Email and OTP are required");

    const user = await User.findone({ email });
    if (!user) returnres.status(404).json("User not found");

    const userId = user._id
      .toString()
      .replace(/^new ObjectId\("(.+)"\)$/, "$1");
    // Create a new TOTP object.
    let totp = new OTPAuth.TOTP({
      issuer: "ACME",
      label: "Alice",
      algorithm: "SHA1",
      digits: 6,
      period: 300,
      secret: OTPAuth.Secret.fromHex(userId), // Use the user's ID as the secret, dont let them know ;)
    });

    let isValid = totp.validate({
        token: otp,
        window: 1,
    });
    if (!isValid) return res.status(400).json("invalid OTP");
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default validateOTP;
