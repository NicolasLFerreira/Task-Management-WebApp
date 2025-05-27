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
				<p className="text-gray-600 dark:text-gray-300">
					Manage your project boards here.
				</p>
				{boards.map((board) => (
					<Board board={board}></Board>
				))}
			</div>
		</PageContainer>
	);
};

export default Boards;
