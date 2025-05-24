"use client";

import React, { useState, useEffect } from "react";
import type { TaskItemDto } from "api-client";
import { TaskItemService } from "api-client";

interface UpdateTaskModalProps {
  taskToUpdate: TaskItemDto;
  onClose: () => void;
  onTaskUpdated: (task: TaskItemDto) => void;
}

const UpdateTaskModal: React.FC<UpdateTaskModalProps> = ({
  taskToUpdate,
  onClose,
  onTaskUpdated,
}) => {
  const [task, setTask] = useState<TaskItemDto>(taskToUpdate);

  useEffect(() => {
    setTask(taskToUpdate);
  }, [taskToUpdate]);

  const handleChange = (field: keyof TaskItemDto, value: string | number | Date | undefined) => {
    setTask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.title || !task.dueDate || !task.priority || !task.progressStatus) {
      return;
    }

    try {
      await TaskItemService.putApiTasksByTaskId({
        path: { taskId: task.id! },
        body: task,
      });
      onTaskUpdated(task);
      onClose();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Task</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={task.title ?? ""}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={task.description ?? ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
              onChange={(e) => handleChange("dueDate", new Date(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={task.priority ?? ""}
              onChange={(e) => handleChange("priority", parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={task.progressStatus ?? ""}
              onChange={(e) => handleChange("progressStatus", parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
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

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTaskModal;
