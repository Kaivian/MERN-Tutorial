// server/src/services/todo/task.service.js
import taskRepository from '../../repositories/todo/task.repository.js';
import { Subject } from '../../models/curriculum/subject.model.js';
import mongoose from 'mongoose';

class TaskService {

    // Helper to calculate urgency
    _calculateUrgency(task) {
        if (!task.endDate) return 0; // No deadline, negligible urgency

        const end = new Date(task.endDate).getTime();
        const now = Date.now();
        const timeRemainingDays = Math.max((end - now) / (1000 * 3600 * 24), 0.1);

        // SubjectId missing or equals null means a personal task
        if (!task.subjectId || task.subjectId === 'personal') {
            return Number((task.difficulty / timeRemainingDays).toFixed(2));
        } else {
            // Need weight
            const wt = task.weight || 0;
            return Number(((wt * task.difficulty) / timeRemainingDays).toFixed(2));
        }
    }

    async createTask(userId, taskData) {
        // Formulate correct subjectId if 'personal' string was passed
        const subjId = (taskData.subjectId === 'personal' || !taskData.subjectId) ? null : taskData.subjectId;

        const enrichedData = {
            ...taskData,
            userId,
            subjectId: subjId
        };

        // Pre-calculate server-side urgency score
        enrichedData.urgencyScore = this._calculateUrgency(enrichedData);

        return await taskRepository.create(enrichedData);
    }

    async getTasksByUser(userId) {
        return await taskRepository.findByUserId(userId);
    }

    async updateTask(userId, taskId, updateData) {
        const task = await taskRepository.findById(taskId);
        if (!task) throw new Error("Task not found");
        if (task.userId.toString() !== userId.toString()) throw new Error("Unauthorized to access this task");

        const mergedData = { ...task.toObject(), ...updateData };
        if (updateData.subjectId === 'personal') mergedData.subjectId = null;

        mergedData.urgencyScore = this._calculateUrgency(mergedData);

        return await taskRepository.updateById(taskId, mergedData);
    }

    async deleteTask(userId, taskId) {
        const task = await taskRepository.findById(taskId);
        if (!task) throw new Error("Task not found");
        if (task.userId.toString() !== userId.toString()) throw new Error("Unauthorized to access this task");

        await taskRepository.deleteById(taskId);
        return { success: true };
    }
}

export default new TaskService();
