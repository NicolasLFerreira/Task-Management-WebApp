import React from "react";
import type { TaskItemDto, TaskItemPriority, TaskItemStatus } from "api-client";

interface TaskCardProps {
	task: TaskItemDto;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
	const stageColors: Record<TaskItemStatus, string> = {
		Todo: "bg-gray-200 text-gray-800",
		InProgress: "bg-yellow-400 text-white",
		Completed: "bg-green-400 text-white",
	};

	const priorityColors: Record<TaskItemPriority, string> = {
		Low: "text-green-600",
		Medium: "text-yellow-600",
		High: "text-red-600",
	};

	return (
		<div className="bg-white p-4 rounded-lg shadow">
			<h3 className="text-lg font-semibold text-gray-900">
				{task.title}
			</h3>
			<h4 className="text-md font-semibold text-gray-700">
				{task.description != "" ? task.description : "No description"}
			</h4>
			<p className="text-sm text-gray-600">
				Due:{" "}
				{new Date(task.dueDate!).toLocaleDateString("en-US", {
					year: "numeric",
					month: "short",
					day: "numeric",
				})}
			</p>
			<p
				className={`text-sm font-medium mt-1 ${priorityColors[task.priority!]}`}
			>
				Priority: {task.priority}
			</p>
			<p
				className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${stageColors[task.progressStatus!]}`}
			>
				{task.progressStatus}
			</p>
		</div>
	);
};

export default TaskCard;
