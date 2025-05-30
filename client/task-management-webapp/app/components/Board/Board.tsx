import { ListService, type BoardDto, type ListDto } from "api-client";
import { useEffect, useState } from "react";
import TaskList from "./TaskListCard";
import { Loader2 } from "lucide-react";

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
	onDelete?: (id: number) => void;
	canDelete?: boolean;
};

const Board = ({ board, onDelete, canDelete }: Props) => {
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
		<div className="bg-gray-300 dark:bg-gray-800 border border-gray-800 text-white group w-full h-full min-w-[250px] min-h-[250px] p-4 rounded-lg shadow-md flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200">
			{/* Header */}
			<div className="mb-2 flex justify-between items-start">
				<div>
					<h3 className="text-lg font-semibold truncate">
						{board.title}
					</h3>
					<p className="text-sm text-gray-400 truncate">
						{board.description}
					</p>
				</div>

				{/* Delete button if owner */}
				{canDelete && onDelete && (
					<button
						onClick={() => onDelete(board.id)}
						title="Delete Board"
						className="text-sm text-red-400 hover:text-red-600 transition-colors"
					>
						Delete
					</button>
				)}
			</div>

			{/* Content */}
			<div className="mt-2 flex-1 overflow-y-auto pr-1">
				{isLoading || error ? (
					<SpecialMessage>
						<div
							className={`text-center font-medium text-base ${error ? "text-red-500" : "text-gray-300"}`}
						>
							{error ?? (
								<div className="flex justify-center py-12">
									<Loader2
										size={32}
										className="animate-spin text-teal-500"
									/>
								</div>
							)}
						</div>
					</SpecialMessage>
				) : taskLists.length === 0 ? (
					<SpecialMessage>
						<div className="text-center font-medium text-base text-gray-400">
							This board contains no lists
						</div>
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
