const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile, } = require('../controllers/authController');

//const authMiddleware  = require('../middleware/authMiddleware');
const  { authenticateUser } = require('../middleware/authMiddleware');


// Route for signup
router.post('/signup', signup);

//Route for login
router.post('/login', login);

//Route for getProfile
router.get('/get-profile', authenticateUser, getProfile);

//Route for update profile
router.put('/update-profile', authenticateUser , updateProfile);


module.exports = router;
