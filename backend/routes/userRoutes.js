const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
require('dotenv').config();

// Sign Up Route
router.post('/signup', async (req, res) => {
    const { email, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, username, password: hashedPassword });
        await user.save();
        res.status(201).json({ userId: user._id, message: 'User created' });;
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).send('Server error');
    }
});

// Sign In Route
router.post('/signin', async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    try {
        const user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); // Use a secure secret
            res.json({ userId: user._id, username: user.username, token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error('Error signing in:', error);
        res.status(500).send('Server error');
    }
});

// Get User Profile Route
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Exclude password from response
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send('Server error');
    }
});

// Update User Profile Route
router.put('/profile/:id', async (req, res) => {
    const { id } = req.params; // Get the user ID from the request parameters
    const { email, username } = req.body; // Get the fields to update from the request body

    try {
        const user = await User.findByIdAndUpdate(id, { email, username }, { new: true }).select('-password');
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json(user);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).send('Server error');
    }
});

// Delete User Profile Route
router.delete('/profile/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(204).send(); // Respond with no content
    } catch (error) {
        console.error('Error deleting user profile:', error);
        res.status(500).send('Server error');
    }
});

// Change Password Route
router.put('/profile/:id/change-password', async (req, res) => {
    const { id } = req.params; // Get the user ID from the request parameters
    const { currentPassword, newPassword } = req.body; // Get the current and new passwords from the request body

    try {
        const user = await User.findById(id); // Find the user by ID
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Verify the current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).send('Current password is incorrect');
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword; // Update the user's password
        await user.save(); // Save the updated user

        res.send('Password updated successfully');
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;