import React from "react";
import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void; // ✅ Add this
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete }) => {
  const stageColors: Record<Task["stage"], string> = {
    "Not started": "bg-gray-200 text-gray-800",
    "In progress": "bg-yellow-400 text-white",
    Completed: "bg-green-400 text-white",
  };

  const priorityColors: Record<Task["priority"], string> = {
    Low: "text-green-600",
    Medium: "text-yellow-600",
    High: "text-red-600",
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow relative">
      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
      <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
      <p className={`text-sm font-medium mt-1 ${priorityColors[task.priority]}`}>
        Priority: {task.priority}
      </p>
      <p className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${stageColors[task.stage]}`}>
        {task.stage}
      </p>

      {/* 🗑️ Delete Button */}
      <button
        onClick={() => {
          if (window.confirm("Are you sure you want to delete this task?")) {
            onDelete(task.id);
          }
          }}
        className="absolute top-2 right-2 text-sm text-red-500 hover:text-red-700"
      >
        ✖
      </button>
    </div>
  );
};

export default TaskCard;
