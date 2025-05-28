import React, { useState, useEffect, useRef, type FormEvent } from "react";
import { BoardService, type BoardCreationDto } from "api-client";

type Props = { closeModal: () => void };

type BoardForm = { title: string; description: string };

const BoardCreationModal = ({ closeModal }: Props) => {
	const [formData, setFormData] = useState<BoardForm>({
		title: "",
		description: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const modalRef = useRef<HTMLDivElement>(null);

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

	// Close on ESC
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				closeModal();
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [closeModal]);

	// Focus trap
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
			className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
			onClick={closeModal}
			role="dialog"
			aria-modal="true"
		>
			<div
				className="bg-gray-900 p-6 rounded-md max-w-md w-full text-white flex flex-col gap-6"
				onClick={(e) => e.stopPropagation()}
				ref={modalRef}
				tabIndex={-1}
			>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<label className="flex flex-col font-semibold text-sm">
						Title:
						<input
							type="text"
							name="title"
							value={formData.title}
							onChange={handleChange}
							className="mt-1 p-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
							disabled={loading}
							autoFocus
						/>
					</label>
					<label className="flex flex-col font-semibold text-sm">
						Description:
						<input
							type="text"
							name="description"
							value={formData.description}
							onChange={handleChange}
							className="mt-1 p-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							disabled={loading}
						/>
					</label>
					{error && <p className="text-red-500 text-xs">{error}</p>}
					<button
						type="submit"
						disabled={loading}
						className={`py-2 font-bold rounded ${loading ? "bg-gray-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
					>
						{loading ? "Submitting..." : "Submit"}
					</button>
				</form>
				<button
					onClick={closeModal}
					disabled={loading}
					className="mt-2 text-white underline bg-transparent border-none cursor-pointer disabled:cursor-not-allowed disabled:text-gray-500"
				>
					Close
				</button>
			</div>
		</div>
	);
};

export default BoardCreationModal;
