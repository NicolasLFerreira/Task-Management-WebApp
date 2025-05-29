import React, { useState, useEffect, useRef, type FormEvent } from "react";
import { BoardService, type BoardCreationDto } from "api-client";
import { X } from "lucide-react";
import FormInputName from "../Common/FormInputName";
import FormInputField from "../Common/FormInputField";
import FormTitle from "../Common/FormTitle";

type Props = { closeModal: () => void };

type BoardForm = { title: string; description: string };

const BoardCreationModal = ({ closeModal }: Props) => {
	const [formData, setFormData] = useState<BoardForm>({
		title: "",
		description: "",
	});
	const [isLoading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const modalRef = useRef<HTMLDivElement>(null);

	const handleSoftClose = () => {
		var response = true;

		if (formData.title !== "" || formData.description !== "") {
			response = confirm(
				"You have unsaved changes, do you wish to proceed?"
			);
		}

		if (response) closeModal();
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);

		if (formData.title.trim().length < 3) {
			setError("Title must be at least 3 characters.");
			return;
		}

		setLoading(true);
		try {
			const board: BoardCreationDto = {
				title: formData.title.trim(),
				description: formData.description.trim(),
				boardMembers: [],
				lists: [],
			};

			await BoardService.postApiBoards({ body: board });
			closeModal();
		} catch {
			setError("Failed to create board. Try again.");
		} finally {
			setLoading(false);
		}
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

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
			onClick={handleSoftClose}
			role="dialog"
			aria-modal="true"
		>
			<div
				className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
				onClick={(e) => e.stopPropagation()}
				ref={modalRef}
				tabIndex={-1}
			>
				<div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
					<FormTitle content="Create New Board" />
					<button
						onClick={handleSoftClose}
						className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
					>
						<X size={20} />
					</button>
				</div>
				<form
					onSubmit={handleSubmit}
					className="flex flex-col gap-4 p-4"
				>
					{/* <label className="flex flex-col font-semibold text-sm"> */}
					<FormInputField
						name="title"
						placeHolder="Board title"
						property={formData.title}
						handleChange={handleChange}
						autoFocus={""}
					>
						Title
					</FormInputField>
					{/* </label> */}
					<FormInputField
						name="description"
						placeHolder="Board description"
						property={formData.description}
						handleChange={handleChange}
					>
						Description
					</FormInputField>
					{error && <p className="text-red-500 text-xs">{error}</p>}
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
							{isLoading ? "Creating..." : "Create Board"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default BoardCreationModal;
