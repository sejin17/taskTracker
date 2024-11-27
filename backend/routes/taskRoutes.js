// backend/routes/taskRoutes.js
const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project'); // Import the Project model
const authMiddleware = require('../middleware/authMiddleware'); // Import the authentication middleware
const router = express.Router();

   // Create Task Route
   router.post('/user/:userId/projects/:projectId/tasks', authMiddleware, async (req, res) => {
    const { title, description, status } = req.body; // Get fields to update
    const userId = req.user.id; // Assuming user ID is set by the auth middleware
    const projectId = req.params.projectId; // Get projectId from request parameters

    try {
        const newTask = new Task({
            title,
            description,
            status,
            projectId, // Link the task to the project
            ownerId: userId // Optional: Link the task to the user
        });

        const savedTask = await newTask.save(); // Save the new task
         // Update the project to include the new task ID
        const project = await Project.findById(projectId);
         if (project) {
             project.tasks.push(savedTask._id); // Add the new task ID to the project's tasks array
             await project.save(); // Save the updated project
         }
        res.status(201).json({ taskId: savedTask._id, task: savedTask });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
});
// Get Tasks Route
router.get('/user/:userId/projects/:projectId/tasks', authMiddleware, async (req, res) => { // Protect this route
    try {
        const tasks = await Task.find({ projectId: req.params.projectId, ownerId: req.user.id }); // Ensure the user owns the tasks
        res.json({ tasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
});

// Update Task Route
router.put('/user/:userId/projects/:projectId/tasks/:taskId', authMiddleware, async (req, res) => {
    const { taskId } = req.params; // Get taskId from request parameters
    const { title, description, status } = req.body; // Get fields to update

    try {
        // Find the task by ID
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Update the task fields
        if (title) task.title = title;
        if (description) task.description = description;
        if (status) task.status = status; // Update status if provided

        const updatedTask = await task.save(); // Save the updated task

        // Ensure the project is updated
        const project = await Project.findById(req.params.projectId);
        if (project) {
            // If the task is already in the project, no need to update the tasks array
            if (!project.tasks.includes(updatedTask._id)) {
                project.tasks.push(updatedTask._id); // Add the task ID to the project's tasks array
                await project.save(); // Save the updated project
            }
        }

        res.status(200).json({ taskId: updatedTask._id, task: updatedTask });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
});

// Delete Task Route
router.delete('/user/:userId/projects/:projectId/tasks/:taskId', authMiddleware, async (req, res) => {
    const { taskId } = req.params; // Get taskId from request parameters

    try {
        // Find the task by ID and delete it
        const deletedTask = await Task.findByIdAndDelete(taskId);
        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Update the project to remove the task ID
        const project = await Project.findById(req.params.projectId);
        if (project) {
            project.tasks = project.tasks.filter(task => task.toString() !== taskId); // Remove the task ID from the project's tasks array
            await project.save(); // Save the updated project
        }

        res.status(200).json({ message: 'Task deleted successfully.', taskId: deletedTask._id });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
});

module.exports = router;