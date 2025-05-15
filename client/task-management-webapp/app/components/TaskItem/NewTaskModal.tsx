import React, { useState } from "react";
import type { TaskItemDto } from "api-client";
import { TaskItemService, TaskItemSpecialisedService } from "api-client";

interface NewTaskModalProps {
	onClose: () => void;
	onTaskCreated: (task: TaskItemDto) => void;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({
	onClose,
	onTaskCreated,
}) => {
	const [task, setTask] = useState<TaskItemDto>({
		title: "",
		description: "",
		dueDate: undefined,
		creationTime: new Date(),
		priority: undefined,
		progressStatus: undefined,
		ownerUserId: 1,
	});

	const handleChange = (field: keyof TaskItemDto, value: any) => {
		setTask((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!task.title ||
			!task.dueDate ||
			!task.priority ||
			!task.progressStatus
		) {
			return; // optionally validate with errors
		}
		TaskItemService.postApiTasks({ body: task }).then((response) => {
			console.log(response.data);
			onTaskCreated(task);
			onClose();
		});
	};

	TaskItemSpecialisedService.getApiTasksQueryingByTitlePattern({
		path: { titlePattern: "title partial name here" },
	}).then((response) => {
		console.log(response.data);
	});

	return (
		<div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
			<div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
				<h2 className="text-xl font-semibold mb-4 text-gray-800">
					Create New Task
				</h2>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Title
						</label>
						<input
							type="text"
							placeholder="Task title"
							className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
							value={task.title ?? ""}
							onChange={(e) =>
								handleChange("title", e.target.value)
							}
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Description
						</label>
						<input
							type="text"
							placeholder="Task description"
							className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
							value={task.description ?? ""}
							onChange={(e) =>
								handleChange("description", e.target.value)
							}
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Due Date
						</label>
						<input
							type="date"
							className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
							value={
								task.dueDate
									? new Date(task.dueDate)
											.toISOString()
											.split("T")[0]
									: ""
							}
							onChange={(e) =>
								handleChange(
									"dueDate",
									new Date(e.target.value)
								)
							}
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Priority
						</label>
						<select
							className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
							value={task.priority ?? ""}
							onChange={(e) =>
								handleChange("priority", e.target.value)
							}
							required
						>
							<option value="">Select</option>
							<option value="High">High</option>
							<option value="Medium">Medium</option>
							<option value="Low">Low</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Status
						</label>
						<select
							className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
							value={task.progressStatus ?? ""}
							onChange={(e) =>
								handleChange("progressStatus", e.target.value)
							}
							required
						>
							<option value="">Select</option>
							<option value="Not started">Not started</option>
							<option value="In progress">In progress</option>
							<option value="Completed">Completed</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Assigned to
						</label>
						<input
							type="number"
							className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
							value={task.ownerUserId ?? ""}
							onChange={(e) =>
								handleChange(
									"ownerUserId",
									Number(e.target.value)
								)
							}
						/>
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
							Save
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default NewTaskModal;
