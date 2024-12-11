import { generateOTP } from "../lib/generateOTP.js";
import generateToken from "../lib/generateToken.js";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

export const createUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    // get the username and password from the request body

    const existingUser = await User.findOne({ username }); // check if the user already exists
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = new User(req.body); // create a new user based on the request body

    const saltRounds = 10; // set the salt rounds

    const hashedPassword = await bcrypt.hash(password, saltRounds); // hash the password

    user.password = hashedPassword; // set the hashed password to the user
    await user.save(); // save the user
    res.status(201).json("User created successfully");
  } catch (error) {
    res.status(400).json({ message: error.message }); // send the error message
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }); // find the user based on the username

    if (!user) return res.status(404).json("User not found");

    const validPassword = await bcrypt.compare(password, user.password); // compare the password with the hashed password

    if (!validPassword) return res.status(400).json("Invalid password"); // send an error message if the password is invalid

    //generate jwt token if user is authenticated
    const token = await generateToken(user._id); // generate a token based on the user id

    res.status(200).json({
      message: "User logged in successfully",
      token: token,
    }); // send a success message
  } catch (error) {
    res.status(500).json({ message: error.message }); // send the error message
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: false }); // get all users from the database based on the User model

    if (!users) return res.status(404).json("No users found");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single user
export const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params; // get the id from the request parameters
    const user = await User.findById(id, { password: false }); // find a user based on the id
    if (!user) return res.status(404).json("User not found");
    res.status(200).json(user); // send the user
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // get the id from the request parameters
    if (!id) return res.status(400).json("User ID is required");

    const data = req.body; // get the data from the request body
    if (!data) return res.status(400).json("request body is required");

    const user = await User.findByIdAndUpdate(id, data);
    if (!user) return res.status(404).json("User not found");

    const insertedUser = await user.save(); // save the user info into the database
    res
      .status(200)
      .json({ message: "User updated successfully", data: insertedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params; // get the id from the request parameters
    if (!id) return res.status(400).json("User ID is required");

    const user = await User.findByIdAndDelete(id); // find a user based on the id and delete it
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
    if (!user) return res.status(404).json("User not found");

    // Remove ObjectId wrapper from user._id
    const userId = user._id
      .toString()
      .replace(/^new ObjectId\("(.+)"\)$/, "$1");

    //generate otp and pass userId to it
    const otp = await generateOTP(userId);

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "dejixice@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // send mail with defined transport object
    const mailOptions = {
      from: "dejixice@gmail.com",
      to: user.email,
      subject: "Your One-Time Password (OTP) Code",
      html: `<html>
  <head>
    <style>
      body {
        font-family: 'Montserrat', Arial, sans-serif;
        background-color: #f9fafb;
        margin: 0;
        padding: 0;
        line-height: 1.6;
      }
      .container {
        width: 100%;
        max-width: 600px;
        background-color: #ffffff;
        margin: 40px auto;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        text-align: center;
        color: #2c3e50;
      }
      .header h2 {
        font-size: 24px;
        margin-bottom: 10px;
        color: #34495e;
      }
      .content {
        color: #555555;
        font-size: 16px;
        margin: 20px 0;
      }
      .otp {
        font-size: 32px;
        font-weight: 600;
        color: #e74c3c;
        text-align: center;
        margin: 20px 0;
        letter-spacing: 2px;
      }

      .button {
        display: inline-block;
        background-color: #3498db;
        color: #ffffff;
        padding: 12px 30px;
        font-size: 16px;
        font-weight: 500;
        text-decoration: none;
        border-radius: 6px;
        text-align: center;
        transition: background-color 0.3s ease;
        margin: 20px 0;
      }
      .button:hover {
        background-color: #2980b9;
      }
      .footer {
        text-align: center;
        color: #7f8c8d;
        font-size: 14px;
        margin-top: 30px;
      }
      .footer p {
        margin: 5px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Password Reset Request</h2>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>We received a request to reset your password. Use the One-Time Password (OTP) below to complete the process:</p>
        <div class="otp">
          ${otp}
        </div>
        <p>The OTP is valid for the next 5 minutes. Please do not share it with anyone.</p>
        <p>If you did not request this, you can safely ignore this email. Your account remains secure.</p>
        <a href="#" class="button">Reset Password</a>
      </div>
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
        res.status(500).json({ message: error.message });
      } else {
        console.log("Email sent: ", info.response);
        res.status(200).json({ message: "OTP sent successfully", OTP: otp });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//login with OTP
export const loginWithOTP = async (req, res) => {
  try {
    const { email } = req.body;
    

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json("User not found");

    //generate jwt token if user is authenticated
    const token = await generateToken(user._id); // generate a token based on the user id

    res.status(200).json({
      message: "User logged in successfully with OTP",
      token: token,
    }); // send a success message
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
