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

        
console.log("login hashed password:", );//

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
    const userId = req.userId; 

    // Find the user by ID and delete it
    const user = await User.findByIdAndDelete(req.user.userId);  // Assuming user ID is saved in the token (middleware)

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User profile deleted successfully' });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//  Change Password 
const changePassword = async (req, res) => {
    console.log("🧩 Token Decoded Info from Middleware:", req.user);
    try {
      const userId = req.userId;
      const { oldPassword, newPassword } = req.body;
  
      // Step 1: Find the user
      const user = await User.findById(req.user.userId);
     
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Step 2: Compare old password
      const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }
  
      // Step 3: Hash new password & update
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      await user.save();
  
      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };
  
  const crypto = require('crypto');

//FORGOT PASSWORD HANDLER
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    // 2. Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 3. Set token and expiry on user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // 4. Simulate email sending (we'll log it to console for now)
    const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetToken}`;
    console.log(`🔗 Password reset link: ${resetUrl}`);

    res.status(200).json({
      message: 'Password reset link sent (check your console 💌)',
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
//RESET PASSWORD
const resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
  
    

      // Find user with valid token that hasn't expired
      let user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
      });
  
      if (!user) {
        
        return res.status(400).json({ message: "Invalid or expired token" });
      }
     
  
      // Hash the new password before saving
      const hashedPassword = await bcrypt.hash(newPassword, 10);

       // Log the hashed password to ensure it's hashed properly
       console.log("🔐 Hashed password:", hashedPassword); //remove if doesnt work
  
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
  
      // const u = await user.save();
       const u = await User.updateOne({email: user.email},{password: hashedPassword});
       console.log("u is[------------------->" , u); 
      
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.log("❌ Error resetting password:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  


module.exports = { signup, login, getProfile, updateProfile, deleteProfile, changePassword, forgotPassword,
    resetPassword, } ;
