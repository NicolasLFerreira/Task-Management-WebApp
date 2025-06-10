"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import PageContainer from "../components/PageContainer";
import TaskCard from "../components/TaskItem/TaskCard";
import TaskDetailModal from "../components/TaskItem/TaskDetailModal";
import {
	TaskItemPriority,
	TaskItemSpecialisedService,
	TaskItemStatus,
} from "api-client";
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
			const response =
				await TaskItemSpecialisedService.postApiTasksQuerying({
					body: filters,
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

	// Re-fetch tasks when filters change
	useEffect(() => {
		fetchTasks();
	}, [filters.priority, filters.status]);

	const handleTaskClick = (task: TaskItemDto) => {
		if (!task.id) {
			setError(
				"Task data is incomplete (missing ID). Cannot open details."
			);
			return;
		}
		setSelectedTaskId(task.id);
		setShowModal(true);
		setError(null);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			event.preventDefault();
			fetchTasks();
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedTaskId(null);
	};

	const handleTaskUpdated = () => {
		fetchTasks();
	};

	const handleTaskDeleted = () => {
		fetchTasks();
		handleCloseModal();
	};

	const handleChangeText = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
	};

	const handleChangeNumber = (e: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFilters((prev) => ({ ...prev, [name]: Number(value) }));
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

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
					<input
						id="title"
						name="title"
						type="text"
						placeholder="Filter by Title"
						value={filters.title ?? ""}
						onChange={handleChangeText}
						onKeyDown={handleKeyDown}
						className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
					/>

					<input
						id="description"
						name="description"
						type="text"
						value={filters.description ?? undefined}
						onChange={handleChangeText}
						onKeyDown={handleKeyDown}
						placeholder="Filter by Description"
						className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
					/>

					<select
						id="status"
						name="status"
						value={filters.status}
						onChange={handleChangeNumber}
						className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
					>
						<option value={undefined}>ignored</option>
						<option value={TaskItemStatus._0}>To Do</option>
						<option value={TaskItemStatus._1}>In Progress</option>
						<option value={TaskItemStatus._2}>In Review</option>
						<option value={TaskItemStatus._3}>Completed</option>
						<option value={TaskItemStatus._4}>Archived</option>
					</select>

					<select
						id="priority"
						name="priority"
						value={filters.priority}
						onChange={handleChangeNumber}
						className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
					>
						<option value={undefined}>ignored</option>
						<option value={TaskItemPriority._0}>Low</option>
						<option value={TaskItemPriority._1}>Medium</option>
						<option value={TaskItemPriority._2}>High</option>
						<option value={TaskItemPriority._3}>Critical</option>
					</select>
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
								id={task.id!}
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
