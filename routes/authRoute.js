const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile, deleteProfile, changePassword, forgotPassword,
    resetPassword } = require('../controllers/authController');


const  { authenticateUser } = require('../middleware/authMiddleware');
// const { deleteProfile } = require('../controllers/authController.js');


// Route for signup
router.post('/signup', signup);

//Route for login
router.post('/login', login);

//Route for getProfile
router.get('/get-profile', authenticateUser, getProfile);

//Route for update profile
router.put('/update-profile', authenticateUser , updateProfile);

//Route for deleting profile
router.delete('/delete-profile', authenticateUser, deleteProfile,);

// Route for changing  password
router.put('/change-password', authenticateUser, changePassword);

//Route for forgot password
router.post('/forgot-password', forgotPassword);
router.post("/reset-password/:token", resetPassword);


module.exports = router;




module.exports = router;
