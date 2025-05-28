import { BoardService, type BoardCreationDto, type ListDto } from "api-client";
import React, { useState, type FormEvent } from "react";

type Props = {
	closeModal: () => void;
};

type BoardForm = {
	title: string;
	description: string;
};

const BoardCreationModal = ({ closeModal }: Props) => {
	const [formData, setFormData] = useState<BoardForm>({
		title: "",
		description: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			var board: BoardCreationDto = {
				title: formData.title,
				description: formData.description,
				boardMembers: [],
				lists: [],
			};

			const response = await BoardService.postApiBoards({ body: board });

			closeModal();
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div
			style={{
				position: "absolute",
				top: "50%",
				left: "50%",
				color: "white",
				transform: "translate(-50%,-50%)",
				msTransform: "translate(-50%,-50%)",
				backgroundColor: "transparent",
			}}
		>
			<div>
				<form onSubmit={handleSubmit}>
					<label>
						Title:
						<input
							type="text"
							name="title"
							value={formData.title}
							onChange={handleChange}
							required
						></input>
					</label>
					<label>
						Description:
						<input
							type="text"
							name="description"
							value={formData.description}
							onChange={handleChange}
							required
						></input>
					</label>
					<button type="submit">submit</button>
				</form>
			</div>
			<button onClick={closeModal}>Close</button>
		</div>
	);
};

export default BoardCreationModal;
