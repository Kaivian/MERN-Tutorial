// client/src/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import { Task } from '@/types/deadline.types';

export function useTasks() {
    const queryClient = useQueryClient();
    const QUERY_KEY = ['tasks'];

    // Fetch Tasks
    const {
        data: tasksData,
        isLoading,
        error
    } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: async () => {
            const response = await taskService.getTasks();
            return response.data;
        },
    });

    // Create Task
    const createMutation = useMutation({
        mutationFn: (newTask: Partial<Task>) => taskService.createTask(newTask),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        }
    });

    // Update Task
    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<Task> }) =>
            taskService.updateTask(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        }
    });

    // Delete Task
    const deleteMutation = useMutation({
        mutationFn: (id: string) => taskService.deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        }
    });

    return {
        tasks: tasksData || [],
        isLoading,
        error,
        createTask: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateTask: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteTask: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending
    };
}
