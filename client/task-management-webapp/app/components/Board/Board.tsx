import { ListService, type BoardDto, type ListDto } from "api-client";
import { useEffect, useState } from "react";
import TaskList from "./TaskListCard";

type Props = {
	board: BoardDto;
};

const Board = ({ board }: Props) => {
	const [taskLists, setTaskLists] = useState<ListDto[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setLoading] = useState<boolean>(false);

	const getTaskLists = async () => {
		try {
			setLoading(true);

			const result = await ListService.getApiListsBoardByBoardId({
				path: { boardId: board.id },
			});

			setTaskLists(result.data ?? []);
			setError(null);
		} catch (err) {
			console.error(err);
			setError("Failed to load lists");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getTaskLists();
	}, [board.id]);

	return (
		<div>
			<div className="bg-amber-500 p-5">
				<p>{board.title}</p>
				<p>{board.description}</p>
				{isLoading ? (
					<p className="text-gray-600">Loading task lists...</p>
				) : error ? (
					<p className="text-red-600">{error}</p>
				) : (
					<div className="bg-green-400 p-1">
						{taskLists.map((list) => (
							<TaskList key={list.id} list={list} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Board;
