// server/src/controllers/todo/task.controller.js
import taskService from '../../services/todo/task.service.js';

class TaskController {
    /**
     * @route POST /api/tasks
     * @desc Create a new task (personal or academic)
     */
    async createTask(req, res, next) {
        try {
            const userId = req.user?.id || req.user?._id;
            const task = await taskService.createTask(userId, req.body);
            res.status(201).success(task, 'Task created successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route GET /api/tasks
     * @desc Get all tasks for the registered user
     */
    async getTasks(req, res, next) {
        try {
            const userId = req.user?.id || req.user?._id;
            const tasks = await taskService.getTasksByUser(userId);
            res.success(tasks, 'Tasks retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route PATCH /api/tasks/:id
     * @desc Update a specific task (e.g. mark subtask complete)
     */
    async updateTask(req, res, next) {
        try {
            const userId = req.user?.id || req.user?._id;
            const taskId = req.params.id;
            const updated = await taskService.updateTask(userId, taskId, req.body);
            res.success(updated, 'Task updated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route DELETE /api/tasks/:id
     * @desc Delete a task
     */
    async deleteTask(req, res, next) {
        try {
            const userId = req.user?.id || req.user?._id;
            const taskId = req.params.id;
            await taskService.deleteTask(userId, taskId);
            res.success(null, 'Task deleted successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new TaskController();
