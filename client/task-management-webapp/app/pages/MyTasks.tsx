"use client";

import { useState, useEffect } from "react";
import PageContainer from "../components/PageContainer";
import TaskCard from "../components/TaskItem/TaskCard";
import TaskDetailModal from "../components/TaskItem/TaskDetailModal";
import { TaskItemSpecialisedService } from "api-client";
import type { TaskItemDto, FilterTaskItemInputDto } from "api-client";
import { Loader2, AlertTriangle, Inbox } from "lucide-react";

const MyTasks = () => {
	const [tasks, setTasks] = useState<TaskItemDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [filters, setFilters] = useState<FilterTaskItemInputDto>({});

	const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
	const [showModal, setShowModal] = useState(false);

	const fetchTasks = async () => {
		setLoading(true);
		setError(null);
		try {
			// Using postApiTasksQuerying with an empty filter to get all tasks
			const emptyFilter: FilterTaskItemInputDto = {};
			const response =
				await TaskItemSpecialisedService.postApiTasksQuerying({
					body: emptyFilter,
				});
			setTasks(response.data || []);
		} catch (err) {
			console.error("Error fetching tasks:", err);
			setError("Failed to load tasks. Please try again.");
			setTasks([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTasks();
	}, []);

	const handleTaskClick = (task: TaskItemDto) => {
		if (!task.id) {
			setError(
				"Task data is incomplete (missing ID). Cannot open details."
			);
			return;
		}
		setSelectedTaskId(task.id);
		setShowModal(true);
		setError(null); // Clear previous errors
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedTaskId(null);
	};

	const handleTaskUpdated = () => {
		fetchTasks(); // Refetch tasks to reflect updates
		// Modal might close itself, or you can explicitly close it:
		// handleCloseModal();
	};

	const handleTaskDeleted = () => {
		fetchTasks(); // Refetch tasks
		handleCloseModal(); // Ensure modal is closed
	};

	if (loading) {
		return (
			<PageContainer>
				<div className="flex justify-center items-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-teal-500" />
					<p className="ml-2 text-gray-600 dark:text-gray-400">
						Loading tasks...
					</p>
				</div>
			</PageContainer>
		);
	}

	return (
		<PageContainer>
			<div className="p-4 md:p-6">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold text-gray-800 dark:text-white">
						My Tasks
					</h1>
				</div>

				{error && (
					<div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-center">
						<AlertTriangle
							size={20}
							className="mr-2 flex-shrink-0"
						/>
						<span>{error}</span>
					</div>
				)}

				{tasks.length === 0 && !loading && !error && (
					<div className="text-center text-gray-500 dark:text-gray-400 py-12">
						<Inbox
							size={48}
							className="mx-auto mb-4 text-gray-400 dark:text-gray-500"
						/>
						<p className="text-xl mb-2">No tasks found.</p>
						<p>
							Looks like your task list is empty. Create some
							tasks on your boards!
						</p>
					</div>
				)}

				{tasks.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
						{tasks.map((task) => (
							<TaskCard
								key={task.id}
								task={task}
								id={task.id!} // Required by TaskCard for dnd-kit
								onClick={() => handleTaskClick(task)}
							/>
						))}
					</div>
				)}
			</div>

			{showModal && selectedTaskId !== null && (
				<TaskDetailModal
					taskId={selectedTaskId}
					onClose={handleCloseModal}
					onTaskUpdated={handleTaskUpdated}
					onTaskDeleted={handleTaskDeleted}
				/>
			)}
		</PageContainer>
	);
};

export default MyTasks;
