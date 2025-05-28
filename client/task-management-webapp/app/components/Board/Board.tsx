import { ListService, type BoardDto, type ListDto } from "api-client";
import { useEffect, useState, type ComponentType } from "react";
import TaskList from "./TaskListCard";

type SpecialMessageProps = {
	children: React.ReactNode;
};

const SpecialMessage = ({ children }: SpecialMessageProps) => {
	return (
		<div className="rounded-xl flex items-center justify-center h-full bg-gray-800/50 px-4 py-2 text-center text-gray-300">
			{children}
		</div>
	);
};

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
		<div className="group w-full h-full min-w-[250px] min-h-[250px] bg-gray-900 border border-gray-800 text-white p-4 rounded-xl shadow-md flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200 ">
			{/* Header */}
			<div className="mb-2">
				<h3 className="text-lg font-semibold truncate">
					{board.title}
				</h3>
				<p className="text-sm text-gray-400 truncate">
					{board.description}
				</p>
			</div>

			{/* Content */}
			<div className="mt-2 flex-1 overflow-y-auto pr-1">
				{isLoading || error ? (
					<SpecialMessage>
						<p
							className={`text-center font-medium text-base ${error ? "text-red-500" : "text-gray-300"}`}
						>
							{error ?? "Loading..."}
						</p>
					</SpecialMessage>
				) : taskLists.length === 0 ? (
					<SpecialMessage>
						<p className="text-center font-medium text-base text-gray-400">
							This board contains no lists
						</p>
					</SpecialMessage>
				) : (
					<div className="space-y-2">
						{taskLists
							.sort((list) => -list.taskCount)
							.slice(0, 3)
							.map((list) => (
								<TaskList key={list.id} list={list} />
							))}
						{taskLists.length > 3 && (
							<p className="ml-2 text-sm text-gray-400">
								And {taskLists.length - 3} more...
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Board;
