"use client";

import PageContainer from "../components/PageContainer";
import { useEffect, useState } from "react";
import { BoardService, type BoardDto } from "api-client";
import Board from "~/components/Board/Board";
import BoardCreationModal from "~/components/Board/BoardCreationModal";

const Boards = () => {
	const [boards, setBoards] = useState<BoardDto[]>([]);
	const [isModalOpen, toggleModal] = useState<boolean>(false);

	const getBoards = async () => {
		try {
			const result = await BoardService.getApiBoards();

			setBoards(result.data ?? []);
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		getBoards();
	}, []);

	const openModal = () => {
		toggleModal(true);
	};

	const closeModal = () => {
		toggleModal(false);
		getBoards();
	};

	return (
		<>
			{isModalOpen ? (
				<BoardCreationModal
					closeModal={closeModal}
				></BoardCreationModal>
			) : (
				<PageContainer>
					<div className="p-4">
						<h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
							Boards
						</h1>
						<p className="text-gray-600 dark:text-gray-300 mb-4">
							Below are all the boards you manage or are part of.
						</p>
						<button
							style={{ opacity: "100%" }}
							className="max-w-50 max-h-15 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
							onClick={openModal}
						>
							Create a board
						</button>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
							{boards.map((board) => (
								<Board key={board.id} board={board} />
							))}
						</div>
					</div>
				</PageContainer>
			)}
		</>
	);
};

export default Boards;
