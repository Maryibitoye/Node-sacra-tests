import { generateOTP } from "../lib/generateOTP.js";
import generateToken from "../lib/generateToken.js";
import User from "../models/usermodel.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

export const createUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username) {
      return res.status(400).send("username is required");
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send("username already exists");
    }

    const user = new User(req.body);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user.password = hashedPassword;
    await user.save();
    res.status(201).json("user created successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json("user not found");

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) return res.status(400).json("Invalid password");

    const token = await generateToken(user._id);

    res.status(200).json({
      message: "user logged in successful",
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAllUser = async (req, res) => {
  try {
    const user = await User.find({}, { password: false });

    if (!user) return res.status(404).json("No user found");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json("user not found");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json("User ID is required");
    const data = req.body;
    if (!data) return res.status(400).json("request body is required");
    const user = await User.findByIdAndUpdate(id, data);
    if (!user) return res.status(404).json("user not found");

    const insertedUser = await user.save(); // save the user info into the database
    res
      .status(200)
      .json({ message: "User updated successfully", data: insertedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json("User ID is required");

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json("User not found");

    res.status(200).json({ message: "User deleted successfully", data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json("user not found");
    // Remove ObjectId wrapper from user._id
    const userId = user._id
      .toString()
      .replace(/^new ObjectId\("(.+)"\)$/, "$1");

    //generate otp
    const otp = await generateOTP(userId);

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "marytoye247@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: "marytoye247@gmail.com",
      to: user.email,
      subject: "Your One-Time Password (OTP) Code",
      html: `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  width: 100%;
                  padding: 40px;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  max-width: 600px;
                  margin: 20px auto;
                }
                .header {
                  text-align: center;
                  color: #333333;
                }
                .otp {
                  font-size: 30px;
                  font-weight: bold;
                  color: #3498db;
                  margin: 20px 0;
                  text-align: center;
                }
                .footer {
                  text-align: center;
                  color: #7f8c8d;
                  font-size: 14px;
                }
                .button {
                  display: inline-block;
                  background-color: #3498db;
                  color: #ffffff;
                  padding: 12px 30px;
                  font-size: 16px;
                  text-decoration: none;
                  border-radius: 4px;
                  text-align: center;
                  margin: 20px 0;
                }
                .button:hover {
                  background-color: #2980b9;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Welcome to Our Platform!</h2>
                </div>
                <p>Hello,</p>
                <p>We received a request to verify your identity. Please use the following One-Time Password (OTP) to proceed:</p>
                <div class="otp">
                  ${otp}
                </div>
                <p>This OTP is valid for the next 5 minutes. If you did not request this, please ignore this email.</p>
                <a href="#" class="button">Verify Now</a>
                <div class="footer">
                  <p>Thank you for using our service.</p>
                  <p>If you have any questions, feel free to contact us.</p>
                </div>
              </div>
            </body>
          </html>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
      } else {
        console.log("Email sent: ", info.response);
      }
    });

    res.status(200).json({ message: "OTP sent successfully", OTP: otp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginWithOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
  

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json("User not found");

    const token = await generateToken(user._id);

    res.status(200).json({
      message: "User logged in successfully with OTP",
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
