const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Login handler
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 3. Create a token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h' // token will expire in 1 hour
        });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Login error", error });
    }
};

// Signup handler
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        const newUser = new User({ name, email, password });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};

//GetProfile
const getProfile = async (req, res) => {
    console.log("Decoded token user info:", req.user); 
    try {
        // req.user was added by the authMiddleware
        const userId = req.user.userId;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

//Update user profile
// @desc   Update user profile
// @route  PUT /api/auth/update-profile
// @access Private
const updateProfile = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { name, email } = req.body;
  
      // Find the user and update only provided fields
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { ...(name && { name }), ...(email && { email }) } },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          name: updatedUser.name,
          email: updatedUser.email,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating profile", error });
    }
  };

  

// Delete user profile
const deleteProfile = async (req, res) => {
  try {
    // Find the user by ID and delete it
    const user = await User.findByIdAndDelete(req.user.userId);  // Assuming user ID is saved in the token (middleware)

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User profile deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



  

module.exports = { signup, login, getProfile, updateProfile, deleteProfile,};
