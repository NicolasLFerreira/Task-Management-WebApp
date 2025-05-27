import type { ListDto } from "api-client";

type Props = {
	list: ListDto;
};

const TaskList = ({ list }: Props) => {
	return (
		<div className="bg-lime-300 m-1 p-1">
			<p>{list.title}</p>
			<p>{list.taskCount}</p>
		</div>
	);
};

export default TaskList;
