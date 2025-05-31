"use client";

import PageContainer from "../components/PageContainer";
import { useEffect, useState } from "react";
import { BoardService, type BoardDto } from "api-client";
import Board from "~/components/Board/Board";
import BoardCreationModal from "~/components/Board/BoardCreationModal";
import { useAuth } from "../contexts/AuthContext";

const Boards = () => {
	const { user } = useAuth();
	const [boards, setBoards] = useState<BoardDto[]>([]);
	const [isModalOpen, toggleModal] = useState<boolean>(false);

	const getBoards = async () => {
		try {
			const result = await BoardService.getApiBoards();
			setBoards(result.data ?? []);
		} catch (err) {
			console.error("Failed to fetch boards:", err);
		}
	};

	// Board deletion
	const handleDelete = async (boardId: number) => {
		const confirmed = window.confirm(
			"Are you sure you want to delete this board?"
		);
		if (!confirmed) return;

		try {
			await BoardService.deleteApiBoardsByBoardId({
				path: { boardId },
			});
			setBoards((prev) => prev.filter((b) => b.id !== boardId));
		} catch (err) {
			console.error("Failed to delete board:", err);
			alert("Something went wrong while deleting the board.");
		}
	};

	useEffect(() => {
		getBoards();
	}, []);

	//#region Modal Control

	const openModal = () => {
		toggleModal(true);
	};

	const closeModal = () => {
		toggleModal(false);
		getBoards();
	};

	//#endregion

	return (
		<PageContainer>
			{isModalOpen && <BoardCreationModal closeModal={closeModal} />}

			<div className="p-4">
				<h1 className="text-2xl font-bold mb-6">Boards</h1>
				<p className="mb-4 font-medium tex-gray-800">
					Below are all the boards you manage or are part of.
				</p>
				<button
					className="max-w-50 max-h-15 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
					onClick={openModal}
				>
					Create a board
				</button>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
					{boards.map((board) => (
						<Board
							key={board.id}
							board={board}
							onDelete={handleDelete}
							canDelete={board.ownerUsername === user?.username}
						/>
					))}
				</div>
			</div>
		</PageContainer>
	);
};

export default Boards;
