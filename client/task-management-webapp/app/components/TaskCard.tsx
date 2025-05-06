import React from "react";
import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
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
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
      <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
      <p className={`text-sm font-medium mt-1 ${priorityColors[task.priority]}`}>Priority: {task.priority}</p>
      <p className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${stageColors[task.stage]}`}>{task.stage}</p>
    </div>
  );
};

export default TaskCard;