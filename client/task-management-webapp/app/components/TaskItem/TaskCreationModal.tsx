"use client";

import {
	LabelService,
	TaskItemPriority,
	TaskItemService,
	TaskItemStatus,
	type ListDto,
	type TaskItemCreationDto,
} from "api-client";
import { AlertCircle, Calendar, Tag, X } from "lucide-react";
import type React from "react";
import { useEffect, useState, useRef } from "react";
import FormInputName from "../Common/FormInputName";
import LabelSelector from "../Label/LabelSelector";

type Props = {
	closeModal: () => void;
	listDto: ListDto;
	onTaskCreated?: () => void;
};

type TaskItemForm = {
	title: string;
	description: string;
	dueDate: string;
	priority: TaskItemPriority;
	status: TaskItemStatus;
	selectedLabelIds: number[];
};

const TaskCreationModal = ({ closeModal, listDto, onTaskCreated }: Props) => {
	const [formData, setFormData] = useState<TaskItemForm>({
		title: "",
		description: "",
		dueDate: "",
		priority: TaskItemPriority._0,
		status: TaskItemStatus._0,
		selectedLabelIds: [],
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showLabelSelector, setShowLabelSelector] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);

	const handleSoftClose = () => {
		var response = true;

		if (
			formData.title !== "" ||
			formData.description !== "" ||
			formData.selectedLabelIds.length !== 0
		) {
			response = confirm(
				"You have unsaved changes, do you wish to proceed?"
			);
		}

		if (response) closeModal();
	};

	// Get boardId from the list's board
	// For now, we'll need to pass boardId separately or fetch it
	// Since ListDto doesn't have board property, we'll use a default
	const boardId = 2; // Using boardId 1

	const handleChange = (
		e: React.ChangeEvent<
			HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// close on escape
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				handleSoftClose();
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [closeModal]);

	// focus to modal
	useEffect(() => {
		const focusableSelectors = [
			"a[href]",
			"button:not([disabled])",
			"textarea:not([disabled])",
			"input:not([disabled])",
			"select:not([disabled])",
			"[tabindex]:not([tabindex='-1'])",
		];
		const modal = modalRef.current;
		if (!modal) return;

		const focusableElements = Array.from(
			modal.querySelectorAll<HTMLElement>(focusableSelectors.join(","))
		);
		if (focusableElements.length === 0) return;

		const firstEl = focusableElements[0];
		const lastEl = focusableElements[focusableElements.length - 1];

		const trapFocus = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;

			if (e.shiftKey) {
				if (document.activeElement === firstEl) {
					e.preventDefault();
					lastEl.focus();
				}
			} else {
				if (document.activeElement === lastEl) {
					e.preventDefault();
					firstEl.focus();
				}
			}
		};

		modal.addEventListener("keydown", trapFocus);
		firstEl.focus();

		return () => modal.removeEventListener("keydown", trapFocus);
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.title.trim()) {
			setError("Title is required");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const requestBody: TaskItemCreationDto = {
				title: formData.title,
				description: formData.description,
				dueDate: new Date(formData.dueDate),
				priority: formData.priority,
				progressStatus: formData.status,
				listId: listDto.id,
			};

			// First create the task
			const taskResponse = await TaskItemService.postApiTasks({
				body: requestBody,
			});

			// If we have labels to add and the task was created successfully
			if (formData.selectedLabelIds.length > 0 && taskResponse.data) {
				const taskId = taskResponse.data?.id;
				if (!taskId) {
					throw new Error("Task created but no ID returned");
				}

				// Add each label to the task
				for (const labelId of formData.selectedLabelIds) {
					await LabelService.postApiLabelsTaskByTaskIdAddByLabelId({
						path: { taskId, labelId },
					});
				}
			}

			if (onTaskCreated) {
				onTaskCreated();
			}
			closeModal();
		} catch (err) {
			console.error("Error creating task:", err);
			setError("Failed to create task. Please try again.");
			// Log more detailed error information
			if (err instanceof Error) {
				console.error("Error details:", err.message);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleLabelToggle = (labelId: number, isSelected: boolean) => {
		if (isSelected) {
			setFormData((prev) => {
				return {
					...prev,
					selectedLabelIds: [...prev.selectedLabelIds, labelId],
				};
			});
		} else {
			setFormData((prev) => {
				return {
					...prev,
					selectedLabelIds: prev.selectedLabelIds.filter(
						(id) => id !== labelId
					),
				};
			});
		}
	};

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
			onClick={handleSoftClose}
		>
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
				<div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
					<h2 className="text-xl font-semibold text-gray-800 dark:text-white">
						Create New Task
					</h2>
					<button
						onClick={handleSoftClose}
						className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
					>
						<X size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-4">
					{error && (
						<div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-start">
							<AlertCircle
								size={18}
								className="mr-2 mt-0.5 flex-shrink-0"
							/>
							<span>{error}</span>
						</div>
					)}

					<div className="mb-4">
						<FormInputName name="title">Title *</FormInputName>
						<input
							id="title"
							name="title"
							type="text"
							value={formData.title}
							onChange={handleChange}
							className="placeholder-white/50 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
							placeholder="Task title"
							autoFocus
							required
						/>
					</div>

					<div className="mb-4">
						<FormInputName name="description">
							Description *
						</FormInputName>
						<textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							className="placeholder-white/50 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
							placeholder="Task description"
							rows={3}
							required
						/>
					</div>

					<div className="mb-4">
						<FormInputName name="dueDate">
							<Calendar size={16} className="mr-1" />
							Due Date
						</FormInputName>
						<input
							id="dueDate"
							name="dueDate"
							value={formData.dueDate}
							type="date"
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
							required
						/>
					</div>

					<div className="grid grid-cols-2 gap-4 mb-4">
						<div>
							<FormInputName name="priority">
								<Tag size={16} className="mr-1" />
								Priority
							</FormInputName>
							<select
								id="priority"
								name="priority"
								value={formData.priority}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
								required
							>
								<option value={TaskItemPriority._0}>Low</option>
								<option value={TaskItemPriority._1}>
									Medium
								</option>
								<option value={TaskItemPriority._2}>
									High
								</option>
								<option value={TaskItemPriority._3}>
									Critical
								</option>
							</select>
						</div>

						<div>
							<FormInputName name="status">Status</FormInputName>
							<select
								id="status"
								name="status"
								value={formData.status}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
								required
							>
								<option value={TaskItemStatus._0}>To Do</option>
								<option value={TaskItemStatus._1}>
									In Progress
								</option>
								<option value={TaskItemStatus._2}>
									In Review
								</option>
								<option value={TaskItemStatus._3}>
									Completed
								</option>
								<option value={TaskItemStatus._4}>
									Archived
								</option>
							</select>
						</div>
					</div>

					<div className="mb-4">
						<div className="flex justify-between items-center">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Labels
							</label>
							<button
								type="button"
								onClick={() =>
									setShowLabelSelector(!showLabelSelector)
								}
								className="text-xs text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
							>
								{showLabelSelector
									? "Hide Labels"
									: "Select Labels"}
							</button>
						</div>

						{showLabelSelector && (
							<div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-md p-2 max-h-40 overflow-y-auto">
								<LabelSelector
									boardId={boardId}
									selectedLabelIds={formData.selectedLabelIds}
									onLabelToggle={handleLabelToggle}
								/>
							</div>
						)}

						{formData.selectedLabelIds.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1">
								<span className="text-xs text-gray-500 dark:text-gray-400">
									{formData.selectedLabelIds.length} label
									{formData.selectedLabelIds.length !== 1
										? "s"
										: ""}{" "}
									selected
								</span>
							</div>
						)}
					</div>

					<div className="flex justify-end space-x-3 mt-6">
						<button
							type="button"
							onClick={handleSoftClose}
							className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-800"
							disabled={isLoading}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-teal-600 border border-transparent rounded-md text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
							disabled={isLoading}
						>
							{isLoading ? "Creating..." : "Create Task"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default TaskCreationModal;
