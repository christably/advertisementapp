const bcrypt = require("bcryptjs");
const User = require("../Models/users");
const { generateToken } = require("../Config/jwtConfig");
const sendEmail = require('../Utilities/email');

// Creating an account
const signUp = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // does the user exist?
    const existingUser = await User.findOne({ email });
    // the findOne method finds the first matching doc using the email criteria,the await waits for the database query to complete before continuing
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    // This code creates a new user record and saves it to the database. hashedPassword - Stores the encrypted password (not plain text)
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      // if no role is provided, default to 'user'
    });
    await user.save();
    // this saves the user object to the database
    
    // Send welcome email after successful user creation
    try {
      const emailResult = await sendEmail(
        user.email,
        'Welcome to Advertisement Website!',
        `${user.name}! Thank you for creating an account with us.`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Advertisement Project, ${user.name}!</h2>
          <p>Thank you for creating an account with us. We're excited to have you on board!</p>
          <p>You can now access your dashboard</p>
        </div>
        `
      );
      
      if (emailResult.success) {
        console.log('Welcome email sent to:', user.email);
      } else {
        console.error('Failed to send welcome email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the signup process if email fails
    }

    // after a user is saved, a token is generated
    const token = generateToken({ userId: user._id, role: user.role });
    // This code creates a JWT token for the newly registered user so they can stay logged in. userId so it can identify which user is making requests and role for checking permissions the person has access to
    res.status(201).json({
      // status 201 means created, thus a user has been created successfully
      message: "User created successfully",
      token,
      user: {
        name: user.name,
        email: user.email,
        // specifying the fields i want as i do not want password exposed even though it is hashed.
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const logIn = async (req, res) => {
  const { email, password } = req.body;
  // only email and password is needed when logging in
  try {
    // the user will be checked if he/she has already signed up
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    // the password will also have to be checked if it is the same one the person signed up with
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    // if everything checks out, generate a token for the user
    const token = generateToken({ userId: user._id, role: user.role });
    res.json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email
        // specifying the fields i want as i do not want password exposed even though it is hashed.
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  signUp,
  logIn,
};