import type { ListDto } from "api-client";

type Props = {
	list: ListDto;
};

const TaskList = ({ list }: Props) => {
	return (
		<div className="rounded-2xl p-5 bg-teal-600">
			<p>{list.title}</p>
			<p>{list.taskCount}</p>
		</div>
	);
};

export default TaskList;
