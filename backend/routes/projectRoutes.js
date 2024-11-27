const express = require('express');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Create Project Route (protected)
router.post('/user/:userId/projects', authMiddleware, async (req, res) => {
    const { title, description } = req.body; // Assuming these fields are part of the project model
    const userId = req.user.id;
    const newProject = new Project({
        title,
        description,
        ownerId: req.user.id // Associate the project with the authenticated user
    });

    try {
        // Check if a project with the same title already exists for the user
        const existingProject = await Project.findOne({ title, ownerId: userId });
        if (existingProject) {
            return res.status(400).json({ message: 'A project with this title already exists.' });
        }

        const newProject = new Project({
            title,
            description,
            ownerId: userId
        });

        const savedProject = await newProject.save();
        res.status(201).json({ projectId: savedProject._id, project: savedProject });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Error creating project', error: error.message });
    }
});
// Get Projects Route (protected)
router.get('/user/:userId/projects', authMiddleware, async (req, res) => {
    console.log(req.user);
    try {
        const projects = await Project.find({ ownerId: req.user.id }); // Assuming you have user authentication middleware
        res.json({ projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete Project Route (protected)
router.delete('/user/:userId/projects/:id', authMiddleware, async (req, res) => {
    const { id } = req.params; // Get the project ID from the request parameters

    try {
        const deletedProject = await Project.findOneAndDelete({ _id: id, ownerId: req.user.id }); // Ensure the user owns the project
        if (!deletedProject) {
            return res.status(404).json({ message: 'Project not found or you do not have permission to delete it.' });
        }
        res.json({ message: 'Project deleted successfully.' }); // Respond with a success message
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Error deleting project', error: error.message });
    }
});

// Update Project Route (PUT)
router.put('/user/:userId/projects/:id', authMiddleware, async (req, res) => {
    const { id } = req.params; // Get the project ID from the request parameters
    const { title, description } = req.body; // Get the fields to update from the request body
    const userId = req.user.id; // Assuming user ID is set by the auth middleware
    try {
        // Find the project and ensure the user owns it
        const project = await Project.findOne({ _id: id, ownerId: userId });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or you do not have permission to update it.' });
        }

        // Update the project fields if provided
        if (title) project.title = title;
        if (description) project.description = description;
        

        const updatedProject = await project.save(); // Save the updated project
        res.json(updatedProject); // Respond with the updated project
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Error updating project', error: error.message });
    }
});


module.exports = router;