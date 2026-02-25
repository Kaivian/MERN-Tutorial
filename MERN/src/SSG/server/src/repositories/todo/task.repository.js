// server/src/repositories/todo/task.repository.js
import Task from '../../models/todo/task.model.js';

class TaskRepository {
    async create(taskData) {
        return await Task.create(taskData);
    }

    async findByUserId(userId) {
        return await Task.find({ userId }).sort({ endDate: 1, startDate: 1 });
    }

    async findById(taskId) {
        return await Task.findById(taskId);
    }

    async updateById(taskId, updateData) {
        return await Task.findByIdAndUpdate(taskId, updateData, { returnDocument: 'after', runValidators: true });
    }

    async deleteById(taskId) {
        return await Task.findByIdAndDelete(taskId);
    }
}

export default new TaskRepository();
