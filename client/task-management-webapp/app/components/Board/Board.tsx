import { ListService, type BoardDto, type ListDto } from "api-client";
import { useEffect, useState } from "react";
import TaskList from "../Tasks/TaskList";

type Props = {
	board: BoardDto;
};

const Board = ({ board }: Props) => {
	const [taskLists, setTaskLists] = useState<ListDto[]>([]);

	useEffect(() => {
		const getTaskLists = async () => {
			try {
				const result = await ListService.getApiListsBoardByBoardId({
					path: { boardId: board.id },
				});

				setTaskLists(result.data ?? []);
			} catch (err) {
				console.log(err);
			}
		};

		getTaskLists();
	}, []);

	return (
		<div>
			<div className="bg-amber-500 p-5">
				<p>{board.title}</p>
				<p>{board.description}</p>
				<div className="bg-green-400 p-1">
					{taskLists.map((list) => (
						<TaskList list={list}></TaskList>
					))}
				</div>
			</div>
		</div>
	);
};

export default Board;
