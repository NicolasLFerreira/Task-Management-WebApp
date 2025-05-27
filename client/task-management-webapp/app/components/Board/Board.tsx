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
		<div className="w-full h-full min-w-[250px] min-h-[250px] bg-gradient-to-br bg-cyan-900 text-white p-4 rounded-2xl shadow-lg flex flex-col overflow-hidden">
			<div>
				<h2 className="text-xl font-semibold truncate">
					{board.title}
				</h2>
				<p className="text-sm text-blue-200 truncate">
					{board.description}
				</p>
			</div>

			<div className="mt-4 flex-1 overflow-auto bg-">
				{isLoading || error ? (
					<div className="rounded-2xl flex items-center justify-center h-full">
						<p
							className={`text-center font-medium text-2xl ${error ? "text-red-600" : "text-white"}`}
						>
							{error ?? "Loading..."}
						</p>
					</div>
				) : (
					<div className="space-y-2">
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
