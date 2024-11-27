const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['to do', 'in progress', 'complete', "won't do"], default: 'to do' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required:true },
    subtasks: [{ title: String, status: { type: String, enum: ['to do', 'in progress', 'complete', "won't do"], default: 'to do' } }]
});

module.exports = mongoose.model('Task', taskSchema);