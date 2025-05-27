"use client";

import React, { useEffect, useState } from "react";
import type { TaskItemDto } from "api-client";
import { TaskItemService } from "api-client";

interface NewTaskModalProps {
  onClose: () => void;
  onTaskCreated: (task: TaskItemDto) => void;
  taskToEdit?: TaskItemDto;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({
  onClose,
  onTaskCreated,
  taskToEdit,
}) => {
  const [task, setTask] = useState<TaskItemDto>({
    title: "",
    description: "",
    dueDate: null,
    creationTime: new Date(),
    priority: undefined,
    progressStatus: undefined,
    ownerUserId: 1, // Placeholder: this can be changed to a prop if needed
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTask({
        ...taskToEdit,
        dueDate: taskToEdit.dueDate
          ? new Date(taskToEdit.dueDate)
          : undefined,
      });
    }
  }, [taskToEdit]);

  const handleChange = (
    field: keyof TaskItemDto,
    value: string | number | Date | null | undefined
  ) => {
    setTask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!task.title || !task.dueDate || task.priority === undefined || task.progressStatus === undefined) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      if (taskToEdit?.id) {
        await TaskItemService.putApiTasksByTaskId({
          path: { taskId: taskToEdit.id },
          body: task,
        });
        onTaskCreated({ ...task, id: taskToEdit.id });
      } else {
        const response = await TaskItemService.postApiTasks({
          body: task,
        });
        if (response.data) {
          onTaskCreated(response.data);
        } else {
          setError("Failed to create task: No data returned.");
          setLoading(false);
          return;
        }
      }

      onClose();
    } catch (err) {
      console.error("Error saving task:", err);
      setError("An error occurred while saving the task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          {taskToEdit ? "Edit Task" : "Create New Task"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
              value={task.title ?? ""}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
              value={task.description ?? ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
              value={
                task.dueDate
                  ? new Date(task.dueDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                handleChange("dueDate", new Date(e.target.value))
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
            <select
              className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
              value={task.priority ?? ""}
              onChange={(e) =>
                handleChange("priority", Number(e.target.value))
              }
              required
            >
              <option value="">Select</option>
              <option value="0">Low</option>
              <option value="1">Medium</option>
              <option value="2">High</option>
              <option value="3">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Progress Status</label>
            <select
              className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
              value={task.progressStatus ?? ""}
              onChange={(e) =>
                handleChange("progressStatus", Number(e.target.value))
              }
              required
            >
              <option value="">Select</option>
              <option value="0">To Do</option>
              <option value="1">In Progress</option>
              <option value="2">Completed</option>
              <option value="3">On Hold</option>
              <option value="4">Cancelled</option>
            </select>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading
                ? taskToEdit
                  ? "Saving..."
                  : "Creating..."
                : taskToEdit
                ? "Save Changes"
                : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;
