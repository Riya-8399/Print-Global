const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6
    },
    resetPasswordToken: {
        type: String,
      },
    resetPasswordExpires: {
        type: Date,
      },
      
});
   
  

// 🔐 Middleware: Runs before saving a user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // only hash if password is new/changed
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', userSchema);
