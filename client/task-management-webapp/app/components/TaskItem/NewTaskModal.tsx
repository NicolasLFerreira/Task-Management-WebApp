"use client"

import { useState, useEffect } from "react";
import { TaskItemService, type TaskItemDto } from "api-client";

const NewTaskModal = ({ onClose, onTaskCreated, taskToEdit }: {
  onClose: () => void;
  onTaskCreated: (task: TaskItemDto) => void;
  taskToEdit?: TaskItemDto;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [priority, setPriority] = useState("1");
  const [progressStatus, setProgressStatus] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      let dateValue = "";
      if (taskToEdit.dueDate instanceof Date) {
        dateValue = taskToEdit.dueDate.toISOString();
      } else if (typeof taskToEdit.dueDate === "string" && taskToEdit.dueDate) {
        dateValue = new Date(taskToEdit.dueDate).toISOString();
      }
      setDueDate(dateValue ? dateValue.split("T")[0] : "");
      setPriority(String(taskToEdit.priority ?? "1"));
      setProgressStatus(String(taskToEdit.progressStatus ?? "0"));
    }
  }, [taskToEdit]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setShowSuccess(false);

    if (loading) return; // Prevent double submission (MUST REMOVE ONCE FIXED)

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters long.");
      return;
    }
    if (description && description.length > 300) {
      setError("Description cannot exceed 300 characters.");
      return;
    }
    if (!["0", "1", "2", "3"].includes(priority)) {
      setError("Priority must be a valid option.");
      return;
    }
    if (!["0", "1", "2", "3", "4"].includes(progressStatus)) {
      setError("Progress status must be a valid option.");
      return;
    }
    if (dueDate && new Date(dueDate) < new Date(new Date().toDateString())) {
      setError("Due date cannot be in the past.");
      return;
    }

    const taskData: TaskItemDto = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: parseInt(priority),
      progressStatus: parseInt(progressStatus),
    };

    try {
      setLoading(true);
      let response;

      // NOTE: This is a mock simulation of backend behavior.
      // When token/auth issues are resolved, this block should be replaced with the real API call.
      response = { data: { id: Math.random().toString(), ...taskData } };
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onTaskCreated(response.data as TaskItemDto);
        onClose();
      }, 1200);

    } catch (err) {
      console.error("Error saving task:", err);
      setError("Failed to save task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          {taskToEdit ? "Edit Task" : "Create New Task"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Task creation form">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="0">Low</option>
              <option value="1">Medium</option>
              <option value="2">High</option>
              <option value="3">Critical</option>
            </select>
          </div>

          <div>
            <label htmlFor="progressStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Progress Status</label>
            <select
              id="progressStatus"
              value={progressStatus}
              onChange={(e) => setProgressStatus(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="0">To Do</option>
              <option value="1">In Progress</option>
              <option value="2">Completed</option>
              <option value="3">On Hold</option>
              <option value="4">Cancelled</option>
            </select>
          </div>

          {error && <p className="text-red-600 text-sm font-semibold" role="alert">{error}</p>}
          {showSuccess && <p className="text-green-600 text-sm font-semibold">✔ Task created successfully!</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border bg-gray-300 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (taskToEdit ? "Saving..." : "Creating...") : (taskToEdit ? "Save Changes" : "Create Task")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;
