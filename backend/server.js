require('dotenv').config();
// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes'); // Import the task routes
const userRoutes = require('./routes/userRoutes'); // Import the user routes
const projectRoutes = require('./routes/projectRoutes'); // Import the project routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/task-tracker', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Use routes
app.use('/api', taskRoutes); // Use the task routes
app.use('/api/user', userRoutes); // Use the user routes
app.use('/api', projectRoutes); // Use the project routes

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});