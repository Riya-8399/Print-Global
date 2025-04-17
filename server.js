const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// require('dotenv').config(); // to load the .env file

const app = express();
dotenv.config();


// Middleware to parse JSON
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoute');
// Use routes
app.use('/api/auth', authRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('✅ Connected to MongoDB Atlas');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
});

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('🚀 Backend is up and running!');
});

app.listen(PORT, () => {
    console.log(`🟢 Server is running on http://localhost:${PORT}`);
});


