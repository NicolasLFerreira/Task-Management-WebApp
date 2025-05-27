"use client";

import PageContainer from "../components/PageContainer";
import { useEffect, useState } from "react";
import { BoardService, type BoardDto } from "api-client";
import Board from "~/components/Board/Board";

const Boards = () => {
	const [boards, setBoards] = useState<BoardDto[]>([]);

	useEffect(() => {
		const getBoards = async () => {
			try {
				const result = await BoardService.getApiBoards();

				setBoards(result.data ?? []);
			} catch (err) {
				console.log(err);
			}
		};

		getBoards();
	}, []);

	return (
		<PageContainer>
			<div className="p-4">
				<h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
					Boards
				</h1>
				<p className="text-gray-600 dark:text-gray-300 mb-4">
					Manage your project boards here.
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{boards.map((board) => (
						<Board key={board.id} board={board} />
					))}
				</div>
			</div>
		</PageContainer>
	);
};

export default Boards;
